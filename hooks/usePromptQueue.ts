import { ChatBtnStatus } from "@/types/chat";
import { computed, ref, onMounted, watch, type Ref } from "vue";

type PromptSender = {
  btnStatus: Ref<ChatBtnStatus>;
  sendPrompt: (prompt: string) => Promise<boolean>;
  interruptAndSendPrompt: (prompt: string) => Promise<boolean>;
  setPrompt: (prompt?: string) => void;
};

type PromptQueueOptions = {
  appSettings: AppSettings;
  canAutoSend?: () => boolean;
  getConversationKey: () => string;
  sender: PromptSender;
};

export function usePromptQueue({ appSettings, canAutoSend, getConversationKey, sender }: PromptQueueOptions) {
  const list = ref<QueueListItem[]>([]);
  const disabledDragListItem = ref(false);
  const isQueuePaused = ref(false);
  const isQueueWaiting = computed(() => list.value.length > 0);

  const addPrompt = (content?: string) => {
    const prompt = content?.trim();
    if (!prompt) return;

    list.value.push({
      id: crypto.randomUUID(),
      content: prompt,
    });
  };

  const removePrompt = (data: QueueListItem) => {
    list.value = list.value.filter((d) => d.id != data?.id);
  };

  const clearQueue = () => {
    list.value = [];
    disabledDragListItem.value = false;
    isQueuePaused.value = false;
  };

  const pauseQueue = () => {
    isQueuePaused.value = true;
    disabledDragListItem.value = true;
  };

  const resumeQueue = () => {
    isQueuePaused.value = false;
    disabledDragListItem.value = false;
    trySendNextPrompt();
  };

  const buildSteerPrompt = (content?: string) => {
    const prompt = content?.trim();
    if (!prompt) return "";

    const template = appSettings.steerPrompt.trim();
    if (!template) return prompt;

    return template.includes("{prompt}")
      ? template.replaceAll("{prompt}", prompt)
      : `${template}\n\n${prompt}`;
  };

  const steerPrompt = async (data: QueueListItem) => {
    const prompt = buildSteerPrompt(data?.content);
    if (!prompt) return;

    disabledDragListItem.value = true;
    isQueuePaused.value = true;

    try {
      const sent = await sender.interruptAndSendPrompt(prompt);
      if (sent) removePrompt(data);
    } finally {
      disabledDragListItem.value = false;
      isQueuePaused.value = false;
    }
  };

  const editPrompt = (data: QueueListItem) => {
    sender.setPrompt(data?.content);
    removePrompt(data);
  };

  const trySendNextPrompt = async () => {
    if (!appSettings.enableQueue || !list.value?.length || isQueuePaused.value) return;
    if (canAutoSend && !canAutoSend()) return;
    if (sender.btnStatus.value !== ChatBtnStatus.IDLE) return;

    disabledDragListItem.value = true;
    const expectedKey = getConversationKey();
    const item = list.value[0];
    if (item?.content && expectedKey === getConversationKey()) {
      const sent = await sender.sendPrompt(item.content);
      if (sent && list.value[0]?.id === item.id) {
        list.value.shift();
      }
    }
    disabledDragListItem.value = false;
  };

  onMounted(() => {
    watch(
      () => appSettings.enableQueue,
      (enabled) => {
        if (enabled) return;

        clearQueue();
      },
    );

    watch(sender.btnStatus, trySendNextPrompt);
  });

  return {
    disabledDragListItem,
    isQueuePaused,
    isQueueWaiting,
    list,
    addPrompt,
    clearQueue,
    delPrompt: removePrompt,
    editPrompt,
    pauseQueue,
    resumeQueue,
    steerPrompt,
  };
}
