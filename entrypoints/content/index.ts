import { useColorMode } from "@vueuse/core";
import App from "./App.vue";
import { aiPlatformMatches } from "@/platforms";
import "~/assets/style.css";
import "~/assets/theme.css";

export default defineContentScript({
  matches: aiPlatformMatches,
  cssInjectionMode: "ui",
  async main(ctx) {
    if (!document.body) return;

    const ui = await createShadowRootUi(ctx, {
      name: "petdex-ui",
      position: "inline",
      anchor: "body",
      onMount: (container, shadow) => {
        const app = createApp(App, { shadowRoot: shadow });

        app.provide("shadowRoot", shadow);
        app.mount(container);
        return app;
      },
      onRemove: (app) => {
        app?.unmount();
      },
    });

    ui.mount();
  },
});
