import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue"],
  webExt: {
    startUrls: ["chat.deepseek.com", "chatgpt.com"],
  },
  vite: () => {
    return {
      plugins: [tailwindcss({})],
    };
  },
  manifest: {
    default_locale: "en",
    name: "__MSG_extName__",
    description: "__MSG_extDescription__",
    permissions: ["storage"],
    action: {
      default_title: "__MSG_extName__",
    },
  },
});
