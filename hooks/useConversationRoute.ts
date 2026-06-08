import type { AiPlatformAdapter } from "@/platforms";
import { useIntervalFn } from "@vueuse/core";
import { ref } from "vue";

export function useConversationRoute(aiPlatform: AiPlatformAdapter) {
  const conversationKey = ref(aiPlatform.getConversationKey());

  useIntervalFn(() => {
    const nextKey = aiPlatform.getConversationKey();
    if (nextKey === conversationKey.value) return;

    conversationKey.value = nextKey;
  }, 200);

  return {
    conversationKey,
  };
}
