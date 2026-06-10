import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue"],
  webExt: {
    startUrls: ["chat.deepseek.com"],
  },
  vite: () => {
    return {
      plugins: [tailwindcss({})],
    };
  },
  manifest: {
    name: "Chat Prompt Queue",
    description:
      "Queue, pause, and steer prompts on supported AI chat pages.",
    permissions: ["storage"],
    action: {
      default_title: "Chat Prompt Queue",
    },
  },
});
