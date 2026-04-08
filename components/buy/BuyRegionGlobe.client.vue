<template>
  <Transition
    enter-active-class="motion-reduce:transition-none motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]"
    enter-from-class="motion-reduce:transform-none motion-reduce:opacity-100 opacity-0 translate-y-5 scale-[0.96]"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="motion-reduce:transition-none motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.4,0,1,1)]"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="motion-reduce:transform-none motion-reduce:opacity-0 opacity-0 translate-y-3 scale-[0.98]"
  >
    <aside
      v-if="region"
      aria-hidden="true"
      class="pointer-events-none fixed bottom-6 right-6 z-20 hidden 2xl:flex"
    >
      <div class="relative size-[21rem] overflow-hidden rounded-full">
        <canvas ref="canvasRef" class="size-full [clip-path:circle(40%)]" />
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { useColorMode } from "#imports";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import type { BuyRegionDescriptor } from "~/utils/buy-region";

type GlobeController = {
  destroy: () => void;
  update: (options: Record<string, unknown>) => void;
};

const props = defineProps<{
  region: BuyRegionDescriptor | null;
}>();

const colorMode = useColorMode();
const canvasRef = ref<HTMLCanvasElement | null>(null);
const isLargeScreen = ref(false);
const prefersReducedMotion = ref(false);

let globe: GlobeController | null = null;
let frameId: number | null = null;
let viewportQuery: MediaQueryList | null = null;
let motionQuery: MediaQueryList | null = null;
let currentPhi = 0;
let currentTheta = 0;
let basePhi = 0;
let baseTheta = 0;
let transitionFromPhi = 0;
let transitionFromTheta = 0;
let transitionStartAt = 0;
let isTransitioning = false;

const activeRegion = computed(() => props.region);
const isLightMode = computed(() => colorMode.value === "light");

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const lerp = (start: number, end: number, amount: number) =>
  start + (end - start) * amount;

const TAU = Math.PI * 2;
const REGION_ANCHOR_PHI_OFFSET = -0.12;
const REGION_ANCHOR_THETA_OFFSET = -0.08;
const REGION_SWITCH_DURATION_MS = 1600;

const normalizeAngle = (value: number) => ((value % TAU) + TAU) % TAU;

const getShortestAngleDelta = (from: number, to: number) => {
  let delta = ((to - from + Math.PI) % TAU) - Math.PI;

  if (delta < -Math.PI) {
    delta += TAU;
  }

  return delta;
};

const mixColor = (
  source: [number, number, number],
  target: [number, number, number],
  amount: number
): [number, number, number] =>
  source.map((channel, index) => lerp(channel, target[index], amount)) as [
    number,
    number,
    number
  ];

const easeInOutCubic = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const getDevicePixelRatio = () =>
  Math.min(Math.max(window.devicePixelRatio || 1, 2.5), 3);

const getCanvasSize = () =>
  canvasRef.value?.getBoundingClientRect().width || 296;

const getRegionOrientation = (region: BuyRegionDescriptor) => {
  const [latitude, longitude] = region.location;
  const latitudeInRadians = (latitude * Math.PI) / 180;
  const longitudeInRadians = (longitude * Math.PI) / 180;

  return {
    // COBE's longitude basis is rotated by a quarter turn, so front-centering
    // a location needs an extra 1.5π offset instead of plain `-longitude`.
    phi: normalizeAngle(
      1.5 * Math.PI - longitudeInRadians + REGION_ANCHOR_PHI_OFFSET
    ),
    theta: clamp(latitudeInRadians + REGION_ANCHOR_THETA_OFFSET, -0.62, 0.62),
  };
};

const createGlobeOptions = ({
  region,
  phi,
  theta,
}: {
  region: BuyRegionDescriptor;
  phi: number;
  theta: number;
}) => {
  const size = getCanvasSize();
  const devicePixelRatio = getDevicePixelRatio();
  const isLight = isLightMode.value;
  const lightMarkerBase: [number, number, number] = [0.24, 0.28, 0.38];

  return {
    width: size * devicePixelRatio,
    height: size * devicePixelRatio,
    devicePixelRatio,
    phi,
    theta,
    dark: isLight ? 0 : 1,
    diffuse: 3,
    mapSamples: prefersReducedMotion.value ? 14000 : 14000,
    mapBrightness: 12,
    mapBaseBrightness: 0,
    baseColor: isLight ? [1, 1, 1] : region.baseColor,
    markerColor: isLight
      ? mixColor(region.markerColor, lightMarkerBase, 0.12)
      : region.markerColor,
    glowColor: isLight
      ? mixColor(region.glowColor, [1, 1, 1], 0.68)
      : region.glowColor,
    markerSize: 2,
    markerElevation: 0.04,
    scale: 1,
    offset: [0, 4],
    opacity: 1,
    markers: [
      {
        location: region.location,
        size: 0.1,
        id: region.key,
        color: region.markerColor,
      },
    ],
  };
};

const stopAnimation = () => {
  if (frameId !== null) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }
};

const destroyGlobe = () => {
  stopAnimation();
  globe?.destroy();
  globe = null;
};

const syncBaseOrientation = (region: BuyRegionDescriptor) => {
  const targetOrientation = getRegionOrientation(region);

  basePhi = targetOrientation.phi;
  baseTheta = targetOrientation.theta;
};

const startTransition = () => {
  transitionFromPhi = currentPhi;
  transitionFromTheta = currentTheta;
  transitionStartAt = performance.now();
  isTransitioning = true;
};

const getIdleOrientation = (now: number) => ({
  phi: normalizeAngle(basePhi + Math.sin(now * 0.00016) * 0.028),
  theta: clamp(baseTheta + Math.cos(now * 0.00014) * 0.016, -0.62, 0.62),
});

const renderFrame = (now = performance.now()) => {
  const region = activeRegion.value;

  if (!globe || !region || !canvasRef.value || !isLargeScreen.value) {
    frameId = null;
    return;
  }

  if (isTransitioning) {
    const progress = Math.min(
      (now - transitionStartAt) / REGION_SWITCH_DURATION_MS,
      1
    );
    const easedProgress = easeInOutCubic(progress);

    currentPhi = normalizeAngle(
      transitionFromPhi +
        getShortestAngleDelta(transitionFromPhi, basePhi) * easedProgress
    );
    currentTheta = lerp(transitionFromTheta, baseTheta, easedProgress);

    if (progress >= 1) {
      isTransitioning = false;
    }
  } else if (!prefersReducedMotion.value) {
    const idleOrientation = getIdleOrientation(now);
    currentPhi = idleOrientation.phi;
    currentTheta = idleOrientation.theta;
  } else {
    currentPhi = basePhi;
    currentTheta = baseTheta;
  }

  globe.update(
    createGlobeOptions({
      region,
      phi: currentPhi,
      theta: currentTheta,
    })
  );

  if (isTransitioning || !prefersReducedMotion.value) {
    frameId = requestAnimationFrame(renderFrame);
    return;
  }

  frameId = null;
};

const ensureGlobe = async () => {
  const region = activeRegion.value;

  if (!region || !isLargeScreen.value) {
    destroyGlobe();
    return;
  }

  await nextTick();

  if (!canvasRef.value) {
    return;
  }

  syncBaseOrientation(region);

  if (!globe) {
    const { default: createGlobe } = await import("cobe");
    currentPhi = basePhi;
    currentTheta = baseTheta;

    globe = createGlobe(
      canvasRef.value,
      createGlobeOptions({
        region,
        phi: currentPhi,
        theta: currentTheta,
      })
    ) as GlobeController;

    if (!prefersReducedMotion.value) {
      frameId = requestAnimationFrame(renderFrame);
    }

    return;
  }

  if (prefersReducedMotion.value) {
    stopAnimation();
    currentPhi = basePhi;
    currentTheta = baseTheta;
    globe.update(
      createGlobeOptions({
        region,
        phi: currentPhi,
        theta: currentTheta,
      })
    );
    return;
  }

  startTransition();

  if (frameId === null) {
    frameId = requestAnimationFrame(renderFrame);
  }
};

const syncViewportState = () => {
  isLargeScreen.value = Boolean(viewportQuery?.matches);
};

const syncMotionState = () => {
  prefersReducedMotion.value = Boolean(motionQuery?.matches);
};

watch(
  [activeRegion, isLargeScreen, isLightMode],
  async ([region, largeScreen]) => {
    if (!region || !largeScreen) {
      destroyGlobe();
      return;
    }

    await ensureGlobe();
  },
  { immediate: true }
);

watch(prefersReducedMotion, ensureGlobe);

onMounted(() => {
  viewportQuery = window.matchMedia("(min-width: 1536px)");
  motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  syncViewportState();
  syncMotionState();

  viewportQuery.addEventListener("change", syncViewportState);
  motionQuery.addEventListener("change", syncMotionState);
});

onBeforeUnmount(() => {
  viewportQuery?.removeEventListener("change", syncViewportState);
  motionQuery?.removeEventListener("change", syncMotionState);
  destroyGlobe();
});
</script>
