<!-- components/Turnstile.vue -->
<template>
  <div ref="turnstile"></div>
</template>

<script>
export default {
  name: "Turnstile",
  props: {
    siteKey: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      widgetId: null,
    };
  },
  mounted() {
    this.loadTurnstile();
  },
  methods: {
    loadTurnstile() {
      if (typeof window.turnstile === "undefined") {
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        script.onload = this.renderWidget;
      } else {
        this.renderWidget();
      }
    },
    renderWidget() {
      this.widgetId = window.turnstile.render(this.$refs.turnstile, {
        sitekey: this.siteKey,
        callback: (token) => {
          this.$emit("verified", token);
        },
      });
    },
    reset() {
      if (this.widgetId) {
        window.turnstile.reset(this.widgetId);
      }
    },
  },
  beforeUnmount() {
    if (this.widgetId) {
      window.turnstile.remove(this.widgetId);
    }
  },
};
</script>
