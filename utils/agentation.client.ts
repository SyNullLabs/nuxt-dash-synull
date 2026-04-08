import { defineNuxtPlugin, useRuntimeConfig } from "nuxt/app";

const AGENTATION_ROOT_ID = "synull-agentation-root";
const AGENTATION_SETTINGS_KEY = "feedback-toolbar-settings";

let cleanupAgentationMount: (() => void) | null = null;
let mountPromise: Promise<void> | null = null;

const syncAgentationDefaults = () => {
  try {
    const stored = localStorage.getItem(AGENTATION_SETTINGS_KEY);
    const parsed = stored ? JSON.parse(stored) : {};

    localStorage.setItem(
      AGENTATION_SETTINGS_KEY,
      JSON.stringify({
        ...parsed,
        blockInteractions: false,
      })
    );
  } catch {
    localStorage.setItem(
      AGENTATION_SETTINGS_KEY,
      JSON.stringify({
        blockInteractions: false,
      })
    );
  }
};

export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.dev || import.meta.server) {
    return;
  }

  const runtimeConfig = useRuntimeConfig();
  const endpoint = runtimeConfig.public.agentationServerUrl || undefined;

  nuxtApp.hook("app:mounted", async () => {
    if (cleanupAgentationMount || mountPromise) {
      return;
    }

    mountPromise = (async () => {
      const container =
        document.getElementById(AGENTATION_ROOT_ID) ||
        document.createElement("div");

      container.id = AGENTATION_ROOT_ID;

      if (!container.isConnected) {
        document.body.appendChild(container);
      }

      syncAgentationDefaults();

      const [{ createElement }, { createRoot }, { Agentation }] =
        await Promise.all([
          import("react"),
          import("react-dom/client"),
          import("agentation"),
        ]);

      // Agentation only ships a React surface, so mount it into an isolated root.
      const root = createRoot(container);

      root.render(
        createElement(Agentation, {
          endpoint,
          className: "synull-agentation-toolbar",
        })
      );

      cleanupAgentationMount = () => {
        root.unmount();
        container.remove();
        cleanupAgentationMount = null;
      };
    })();

    try {
      await mountPromise;
    } finally {
      mountPromise = null;
    }
  });

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      cleanupAgentationMount?.();
    });
  }
});
