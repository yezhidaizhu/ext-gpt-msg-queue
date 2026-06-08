import type { AiPlatformAdapter } from "@/platforms";
import { ChatBtnStatus } from "@/types/chat";
import { useActiveElement, useIntervalFn } from "@vueuse/core";
import { debounce } from "lodash-es";
import { onScopeDispose } from "vue";

export function useChatStatus(
  aiPlatform: AiPlatformAdapter,
  options?: {
    appSettings?: AppSettings;
    // 处理中发送
    onProcessSend?: (val?: string) => any;
  },
) {
  const getChatBtnStatus = () => {
    return aiPlatform.getStatus();
  };

  const stopGeneratingAndWaitIdle = async (timeout = 6000) => {
    if (getChatBtnStatus() !== ChatBtnStatus.GENERATING) return true;

    aiPlatform.clickStop();

    return new Promise<boolean>((resolve) => {
      const startedAt = Date.now();

      const timer = window.setInterval(() => {
        if (getChatBtnStatus() === ChatBtnStatus.IDLE) {
          window.clearInterval(timer);
          resolve(true);
          return;
        }

        if (Date.now() - startedAt >= timeout) {
          window.clearInterval(timer);
          resolve(false);
        }
      }, 100);
    });
  };

  /**
   * 处理发送
   * 1. 监听 textarea 是否 focus，同时有没有 ai 回复中，是否按下 enter 键
   */
  const activeElement = useActiveElement({
    deep: false,
  });

  const handleEnter = () => {
    if (!options?.appSettings?.enableQueue) return false;
    if (getChatBtnStatus() !== ChatBtnStatus.GENERATING) return false;
    options?.onProcessSend?.(aiPlatform.getPrompt());
    aiPlatform.setPrompt("");
    return true;
  };

  const bindTextareaEnter = debounce((keyboardEvent: Event) => {
    const e = keyboardEvent as KeyboardEvent;
    if (e.isComposing) return;

    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !e.metaKey
    ) {
      if (handleEnter()) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }, 200);

  const stopActiveElementWatch = watch(activeElement, (_el, _oldEl, onCleanup) => {
    const input = aiPlatform.getInput();
    if (!input || activeElement.value !== input) return;
    input.addEventListener("keydown", bindTextareaEnter);

    const removeListener = () => {
      input.removeEventListener("keydown", bindTextareaEnter);
    };

    onCleanup(removeListener);
  });
  onScopeDispose(stopActiveElementWatch);

  /**
   * ai 是否在回复中，状态监听
   */
  const btnStatus = ref<ChatBtnStatus>(ChatBtnStatus.UNKOWN);
  onMounted(() => {
    useIntervalFn(() => {
      if (!aiPlatform.getInput()) {
        // 如果没有输入框，我也不知道是啥状态
        btnStatus.value = ChatBtnStatus.UNKOWN;
      } else {
        btnStatus.value = getChatBtnStatus();
      }
    }, 200);
  });

  /**
   * 设置 textarea 的值并发送
   */
  const sendPrompt = (newVal: string) => {
    if (!newVal) return;
    // 先保存原来的 promt
    const oldV = aiPlatform.getPrompt();
    aiPlatform.setPrompt(newVal);
    setTimeout(() => {
      aiPlatform.clickSend();
      aiPlatform.setPrompt(oldV);
    });
  };

  const interruptAndSendPrompt = async (newVal: string) => {
    if (!newVal) return false;

    const oldV = aiPlatform.getPrompt();

    await stopGeneratingAndWaitIdle();

    aiPlatform.setPrompt(newVal);
    aiPlatform.clickSend();
    setTimeout(() => {
      aiPlatform.setPrompt(oldV);
    });

    return true;
  };

  return {
    btnStatus,
    sendPrompt,
    interruptAndSendPrompt,
    setPrompt: (prompt?: string) => aiPlatform.setPrompt(prompt || ""),
  };
}
