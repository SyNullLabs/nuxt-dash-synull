<template>
  <Teleport to="#dashboard-main">
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
        class="pointer-events-none absolute top-0 bottom-0 left-0 right-4 z-20 hidden overflow-hidden 2xl:block"
      >
        <div class="absolute bottom-0 right-0 size-[26rem]">
          <div class="relative size-full">
          <div
            class="size-full pointer-events-auto touch-none"
            :class="isDragging ? 'cursor-grabbing' : 'cursor-grab'"
            @pointerdown="handlePointerDown"
          >
            <canvas ref="canvasRef" class="size-full" />
          </div>

          <div
            v-for="overlayRegion in overlayRegions"
            :key="`marker-${overlayRegion.key}`"
            class="pointer-events-none absolute z-10 size-2.5 rounded-full motion-reduce:transition-none motion-safe:transition-[opacity,filter,transform] motion-safe:duration-300"
            :class="
              isLightMode
                ? 'bg-slate-900/72 shadow-[0_0_0_6px_rgba(15,23,42,0.08)]'
                : 'bg-white/90 shadow-[0_0_0_6px_rgba(255,255,255,0.12),0_0_18px_rgba(255,255,255,0.18)]'
            "
            :style="getRegionMarkerStyle(overlayRegion)"
          ></div>

          <div
            v-for="overlayRegion in overlayRegions"
            :key="`tag-${overlayRegion.key}`"
            class="pointer-events-none absolute z-20"
            :style="getRegionTagStyle(overlayRegion)"
          >
            <div
              class="rounded-full border break-words px-3 py-1.5 text-center text-[0.68rem] font-semibold uppercase leading-4 tracking-[0.16em] shadow-lg backdrop-blur-md motion-reduce:transition-none motion-safe:transition-[opacity,filter,transform] motion-safe:duration-300"
              :class="
                isLightMode
                  ? 'border-black/10 bg-white/78 text-slate-800 shadow-black/10'
                  : 'border-white/12 bg-slate-950/72 text-white/90 shadow-black/30'
              "
              :style="getRegionTagVisualStyle(overlayRegion)"
            >
              {{ overlayRegion.name }}
            </div>
          </div>
        </div>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { layoutWithLines, prepareWithSegments } from "@chenglou/pretext";
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

type RegionTagMetrics = {
  minHeight: number;
  width: number;
};

const props = defineProps<{
  region: BuyRegionDescriptor | null;
}>();

const colorMode = useColorMode();
const canvasRef = ref<HTMLCanvasElement | null>(null);
const isLargeScreen = ref(false);
const prefersReducedMotion = ref(false);
const isDragging = ref(false);
const overlayRegions = ref<BuyRegionDescriptor[]>([]);

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
let autoRotateOffset = 0;
let lastFrameAt = 0;
let userPhiOffset = 0;
let userThetaOffset = 0;
let activePointerId: number | null = null;
let dragStartX = 0;
let dragStartY = 0;
let dragStartPhi = 0;
let dragStartTheta = 0;
let dragVelocityPhi = 0;
let dragVelocityTheta = 0;
let lastDragSampleAt = 0;
let lastDragPhi = 0;
let lastDragTheta = 0;
let isMomentumActive = false;
let lastRegionKey: string | null = null;
let overlayCleanupTimer: ReturnType<typeof setTimeout> | null = null;
const exitingOverlayKeys = ref<string[]>([]);

const activeRegion = computed(() => props.region);
const isLightMode = computed(() => colorMode.value === "light");
const GLOBE_TAG_FONT =
  '600 11px "Alimama FangYuanTi VF", "Inter", system-ui, sans-serif';
const GLOBE_TAG_LINE_HEIGHT = 16;
const GLOBE_TAG_MAX_TEXT_WIDTH = 128;
const GLOBE_TAG_HORIZONTAL_PADDING = 24;
const GLOBE_TAG_VERTICAL_PADDING = 12;
const GLOBE_TAG_BORDER_SIZE = 2;
const GLOBE_TAG_MEASURE_WIDTH = 4096;
const GLOBE_TAG_LETTER_SPACING = 11 * 0.16;
const preparedTagTextCache = new Map<string, ReturnType<typeof prepareWithSegments>>();
const regionTagMetricsCache = new Map<string, RegionTagMetrics>();

const getTrackedLineWidth = (lineText: string, lineWidth: number) =>
  lineWidth +
  Math.max(Array.from(lineText).length - 1, 0) * GLOBE_TAG_LETTER_SPACING;

const getPreparedTagText = (text: string) => {
  const cachedPreparedText = preparedTagTextCache.get(text);

  if (cachedPreparedText) {
    return cachedPreparedText;
  }

  const preparedText = prepareWithSegments(text, GLOBE_TAG_FONT);
  preparedTagTextCache.set(text, preparedText);

  return preparedText;
};

const getRegionTagMetrics = (text: string) => {
  const normalizedText = text.toUpperCase();
  const cachedMetrics = regionTagMetricsCache.get(normalizedText);

  if (cachedMetrics) {
    return cachedMetrics;
  }

  const preparedText = getPreparedTagText(normalizedText);
  const naturalLayout = layoutWithLines(
    preparedText,
    GLOBE_TAG_MEASURE_WIDTH,
    GLOBE_TAG_LINE_HEIGHT
  );
  const shouldWrap = naturalLayout.lines.some(
    (line) => getTrackedLineWidth(line.text, line.width) > GLOBE_TAG_MAX_TEXT_WIDTH
  );
  const wrappedLayout = shouldWrap
    ? layoutWithLines(
        preparedText,
        GLOBE_TAG_MAX_TEXT_WIDTH,
        GLOBE_TAG_LINE_HEIGHT
      )
    : naturalLayout;
  const widestLine = wrappedLayout.lines.reduce(
    (maxWidth, line) =>
      Math.max(maxWidth, getTrackedLineWidth(line.text, line.width)),
    0
  );
  const metrics = {
    minHeight: Math.ceil(
      wrappedLayout.lineCount * GLOBE_TAG_LINE_HEIGHT +
        GLOBE_TAG_VERTICAL_PADDING +
        GLOBE_TAG_BORDER_SIZE
    ),
    width: Math.ceil(
      widestLine + GLOBE_TAG_HORIZONTAL_PADDING + GLOBE_TAG_BORDER_SIZE
    ),
  };

  regionTagMetricsCache.set(normalizedText, metrics);

  return metrics;
};

const getRegionMarkerStyle = (region: BuyRegionDescriptor) => {
  const visibility = `var(--cobe-visible-${region.key}, 0)`;
  const isExiting = exitingOverlayKeys.value.includes(region.key);

  return {
    positionAnchor: `--cobe-${region.key}`,
    left: "anchor(center)",
    top: "anchor(center)",
    opacity: isExiting ? "0" : visibility,
    transform: isExiting
      ? "translate(-50%, -50%) scale(0.7)"
      : `translate(-50%, -50%) scale(calc(0.78 + ${visibility} * 0.22))`,
    filter: isExiting ? "blur(8px)" : `blur(calc((1 - ${visibility}) * 4px))`,
  };
};
const getRegionTagStyle = (region: BuyRegionDescriptor) => {
  return {
    positionAnchor: `--cobe-${region.key}`,
    left: "anchor(left)",
    top: "anchor(top)",
    transform: "translate(calc(-100% - 0.8rem), calc(-100% - 0.35rem))",
  };
};
const getRegionTagVisualStyle = (region: BuyRegionDescriptor) => {
  const isExiting = exitingOverlayKeys.value.includes(region.key);
  const tagMetrics = getRegionTagMetrics(region.name);

  return {
    opacity: isExiting ? "0" : `var(--cobe-visible-${region.key}, 0)`,
    filter: isExiting
      ? "blur(10px)"
      : `blur(calc((1 - var(--cobe-visible-${region.key}, 0)) * 6px))`,
    transform: isExiting ? "scale(0.96)" : "scale(1)",
    minHeight: `${tagMetrics.minHeight}px`,
    width: `${tagMetrics.width}px`,
  };
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const lerp = (start: number, end: number, amount: number) =>
  start + (end - start) * amount;

const TAU = Math.PI * 2;
const REGION_ANCHOR_PHI_OFFSET = -0.5;
const REGION_ANCHOR_THETA_OFFSET = -0.5;
const REGION_SWITCH_DURATION_MS = 1800;
const GLOBE_DRAG_ROTATION_SENSITIVITY = 0.006;
const GLOBE_MAX_DRAG_VELOCITY = 0.0028;
const GLOBE_MOMENTUM_DAMPING = 0.012;
const GLOBE_MOMENTUM_STOP_THRESHOLD = 0.00002;
const GLOBE_AUTO_ROTATE_SPEED = 0.00009;
const GLOBE_RENDER_PIXEL_RATIO = 2;
const GLOBE_MAP_SAMPLES = 24000;

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

const getDevicePixelRatio = () => GLOBE_RENDER_PIXEL_RATIO;

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
  const activeOverlayRegions = overlayRegions.value.length
    ? overlayRegions.value
    : [region];

  return {
    width: size * devicePixelRatio,
    height: size * devicePixelRatio,
    devicePixelRatio: devicePixelRatio,
    phi,
    theta,
    dark: isLight ? 0 : 1,
    diffuse: 3,
    mapSamples: GLOBE_MAP_SAMPLES,
    mapBrightness: 12,
    mapBaseBrightness: 0,
    baseColor: isLight ? [1, 1, 1] : region.baseColor,
    markerColor: isLight
      ? mixColor(region.markerColor, lightMarkerBase, 0.12)
      : region.markerColor,
    glowColor: isLight ? [1, 1, 1] : region.baseColor,
    markerSize: 2,
    markerElevation: 0.04,
    scale: 1.75,
    offset: [300, 300],
    opacity: 1,
    markers: activeOverlayRegions.map((overlayRegion) => ({
      location: overlayRegion.location,
      size: 0.0001,
      id: overlayRegion.key,
      color: overlayRegion.markerColor,
    })),
  };
};

const updateGlobeFrame = () => {
  const region = activeRegion.value;

  if (!globe || !region) {
    return;
  }

  globe.update(
    createGlobeOptions({
      region,
      phi: currentPhi,
      theta: currentTheta,
    })
  );
};

const clearOverlayCleanupTimer = () => {
  if (overlayCleanupTimer !== null) {
    clearTimeout(overlayCleanupTimer);
    overlayCleanupTimer = null;
  }
};

const syncOverlayRegions = (
  region: BuyRegionDescriptor | null,
  previousRegion: BuyRegionDescriptor | null,
  largeScreen: boolean
) => {
  clearOverlayCleanupTimer();

  if (!region || !largeScreen) {
    overlayRegions.value = [];
    exitingOverlayKeys.value = [];
    return;
  }

  if (
    prefersReducedMotion.value ||
    !previousRegion ||
    previousRegion.key === region.key
  ) {
    overlayRegions.value = [region];
    exitingOverlayKeys.value = [];
    return;
  }

  overlayRegions.value = [previousRegion, region];
  exitingOverlayKeys.value = [previousRegion.key];
  overlayCleanupTimer = setTimeout(() => {
    overlayRegions.value = [region];
    exitingOverlayKeys.value = [];
    overlayCleanupTimer = null;
  }, 320);
};

const stopAnimation = () => {
  if (frameId !== null) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }

  lastFrameAt = 0;
};

const destroyGlobe = () => {
  stopAnimation();
  isDragging.value = false;
  isMomentumActive = false;
  activePointerId = null;
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
  autoRotateOffset = 0;
  dragVelocityPhi = 0;
  dragVelocityTheta = 0;
  isMomentumActive = false;
  lastFrameAt = 0;
};

const getIdleOrientation = (now: number) => ({
  phi: normalizeAngle(basePhi + userPhiOffset + autoRotateOffset),
  theta: clamp(
    baseTheta + userThetaOffset + Math.cos(now * 0.00014) * 0.012,
    -0.62,
    0.62
  ),
});

const restartAnimation = () => {
  if (frameId === null && !prefersReducedMotion.value) {
    frameId = requestAnimationFrame(renderFrame);
  }
};

const handlePointerDown = (event: PointerEvent) => {
  if (!globe || !isLargeScreen.value) {
    return;
  }

  event.preventDefault();
  isDragging.value = true;
  isTransitioning = false;
  isMomentumActive = false;
  activePointerId = event.pointerId;
  dragStartX = event.clientX;
  dragStartY = event.clientY;
  dragStartPhi = currentPhi;
  dragStartTheta = currentTheta;
  dragVelocityPhi = 0;
  dragVelocityTheta = 0;
  lastDragSampleAt = performance.now();
  lastDragPhi = currentPhi;
  lastDragTheta = currentTheta;
  autoRotateOffset = 0;
  stopAnimation();
};

const handlePointerMove = (event: PointerEvent) => {
  if (
    !isDragging.value ||
    activePointerId === null ||
    event.pointerId !== activePointerId
  ) {
    return;
  }

  const deltaX = event.clientX - dragStartX;
  const deltaY = event.clientY - dragStartY;

  currentPhi = normalizeAngle(
    dragStartPhi + deltaX * GLOBE_DRAG_ROTATION_SENSITIVITY
  );
  currentTheta = clamp(
    dragStartTheta + deltaY * GLOBE_DRAG_ROTATION_SENSITIVITY,
    -0.62,
    0.62
  );
  const now = performance.now();
  const sampleDeltaMs = Math.max(now - lastDragSampleAt, 1);

  dragVelocityPhi = clamp(
    getShortestAngleDelta(lastDragPhi, currentPhi) / sampleDeltaMs,
    -GLOBE_MAX_DRAG_VELOCITY,
    GLOBE_MAX_DRAG_VELOCITY
  );
  dragVelocityTheta = clamp(
    (currentTheta - lastDragTheta) / sampleDeltaMs,
    -GLOBE_MAX_DRAG_VELOCITY,
    GLOBE_MAX_DRAG_VELOCITY
  );
  lastDragSampleAt = now;
  lastDragPhi = currentPhi;
  lastDragTheta = currentTheta;
  userPhiOffset = getShortestAngleDelta(basePhi, currentPhi);
  userThetaOffset = currentTheta - baseTheta;
  updateGlobeFrame();
};

const handlePointerUp = (event: PointerEvent) => {
  if (
    !isDragging.value ||
    activePointerId === null ||
    event.pointerId !== activePointerId
  ) {
    return;
  }

  isDragging.value = false;
  activePointerId = null;
  isMomentumActive =
    Math.abs(dragVelocityPhi) > GLOBE_MOMENTUM_STOP_THRESHOLD ||
    Math.abs(dragVelocityTheta) > GLOBE_MOMENTUM_STOP_THRESHOLD;
  lastFrameAt = 0;
  restartAnimation();
};

const renderFrame = (now = performance.now()) => {
  const region = activeRegion.value;
  const deltaMs = lastFrameAt === 0 ? 0 : now - lastFrameAt;

  lastFrameAt = now;

  if (!globe || !region || !canvasRef.value || !isLargeScreen.value) {
    frameId = null;
    lastFrameAt = 0;
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
      lastFrameAt = now;
    }
  } else if (isMomentumActive) {
    userPhiOffset = getShortestAngleDelta(
      basePhi,
      normalizeAngle(basePhi + userPhiOffset + dragVelocityPhi * deltaMs)
    );
    userThetaOffset =
      clamp(
        baseTheta + userThetaOffset + dragVelocityTheta * deltaMs,
        -0.62,
        0.62
      ) - baseTheta;
    currentPhi = normalizeAngle(basePhi + userPhiOffset);
    currentTheta = clamp(baseTheta + userThetaOffset, -0.62, 0.62);

    const dampingFactor = Math.exp(-deltaMs * GLOBE_MOMENTUM_DAMPING);

    dragVelocityPhi *= dampingFactor;
    dragVelocityTheta *= dampingFactor;

    if (
      Math.abs(dragVelocityPhi) <= GLOBE_MOMENTUM_STOP_THRESHOLD &&
      Math.abs(dragVelocityTheta) <= GLOBE_MOMENTUM_STOP_THRESHOLD
    ) {
      dragVelocityPhi = 0;
      dragVelocityTheta = 0;
      isMomentumActive = false;
    }
  } else if (!prefersReducedMotion.value) {
    autoRotateOffset = normalizeAngle(
      autoRotateOffset + deltaMs * GLOBE_AUTO_ROTATE_SPEED
    );
    const idleOrientation = getIdleOrientation(now);
    currentPhi = idleOrientation.phi;
    currentTheta = idleOrientation.theta;
  } else {
    autoRotateOffset = 0;
    currentPhi = basePhi;
    currentTheta = baseTheta;
  }

  updateGlobeFrame();

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

  if (region.key !== lastRegionKey) {
    userPhiOffset = 0;
    userThetaOffset = 0;
    autoRotateOffset = 0;
    dragVelocityPhi = 0;
    dragVelocityTheta = 0;
    isMomentumActive = false;
    lastRegionKey = region.key;
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
  [activeRegion, isLargeScreen],
  async ([region, largeScreen], [previousRegion]) => {
    syncOverlayRegions(region, previousRegion, largeScreen);

    if (!region || !largeScreen) {
      destroyGlobe();
      return;
    }

    await ensureGlobe();
  },
  { immediate: true }
);

watch(isLightMode, updateGlobeFrame);
watch(prefersReducedMotion, ensureGlobe);

onMounted(() => {
  viewportQuery = window.matchMedia("(min-width: 1536px)");
  motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  syncViewportState();
  syncMotionState();

  viewportQuery.addEventListener("change", syncViewportState);
  motionQuery.addEventListener("change", syncMotionState);
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);
  window.addEventListener("pointercancel", handlePointerUp);
});

onBeforeUnmount(() => {
  clearOverlayCleanupTimer();
  viewportQuery?.removeEventListener("change", syncViewportState);
  motionQuery?.removeEventListener("change", syncMotionState);
  window.removeEventListener("pointermove", handlePointerMove);
  window.removeEventListener("pointerup", handlePointerUp);
  window.removeEventListener("pointercancel", handlePointerUp);
  destroyGlobe();
});
</script>
