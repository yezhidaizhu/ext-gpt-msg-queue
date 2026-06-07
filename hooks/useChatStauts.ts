import { DeepseekConfig } from "@/config/chat-textarea";
import { ChatBtnStatus } from "@/types/chat";
import { useActiveElement, useIntervalFn } from "@vueuse/core";
import { debounce } from "lodash-es";

export function useChatStauts(
  aiPlatformConfig: typeof DeepseekConfig,
  options?: {
    // 处理中发送
    onProcessSend?: (val?: string) => any;
  },
) {
  const textaraSelector = aiPlatformConfig.textaraSelector;

  const btnStatusSelectors = aiPlatformConfig.btnStatusSelectors;

  const getTextareaVal = () => {
    return ($(textaraSelector) as HTMLTextAreaElement)?.value;
  };

  const setTextareaVal = (val?: string) => {
    const node = $(textaraSelector) as HTMLTextAreaElement;
    if (!node) return;
    fillPromptInput(node, val || "");
  };

  /**
   * 处理发送
   * 1. 监听 textarea 是否 focus，同时有没有 ai 回复中，是否按下 enter 键
   */
  const activeElement = useActiveElement({
    deep: false,
  });

  const handleEnter = () => {
    if ($(btnStatusSelectors.ready)) return;
    options?.onProcessSend?.(getTextareaVal());
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
      e.preventDefault();
      e.stopPropagation();
      handleEnter();
      setTextareaVal();
    }
  }, 200);

  watch(activeElement, (el) => {
    const textarea = $(textaraSelector);
    if (!textarea || activeElement.value !== textarea) return;
    textarea.addEventListener("keydown", bindTextareaEnter);
  });

  /**
   * ai 是否在回复中，状态监听
   */
  const btnStatus = ref<ChatBtnStatus>(ChatBtnStatus.UNKOWN);
  onMounted(() => {
    const { pause } = useIntervalFn(() => {
      if (!$(textaraSelector)) {
        // 如果没有输入框，我也不知道是啥状态
        pause();
        btnStatus.value = ChatBtnStatus.UNKOWN;
      } else {
        btnStatus.value = !!$(btnStatusSelectors.generating)
          ? ChatBtnStatus.GENERATING
          : ChatBtnStatus.IDLE;
      }
    }, 200);
  });

  /**
   * 设置 textarea 的值并发送
   */
  const sendPrompt = (newVal: string) => {
    if (!newVal) return;
    // 先保存原来的 promt
    const oldV = getTextareaVal();
    setTextareaVal(newVal);
    setTimeout(() => {
      ($(btnStatusSelectors.ready) as HTMLButtonElement)?.click();
      setTextareaVal(oldV);
    });
  };

  return {
    btnStatus,
    sendPrompt,
    setTextareaVal,
  };
}
