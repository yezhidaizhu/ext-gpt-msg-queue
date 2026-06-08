import { ChatBtnStatus } from "@/types/chat";
import { ref, onMounted, watch, type Ref } from "vue";

type PromptSender = {
  btnStatus: Ref<ChatBtnStatus>;
  sendPrompt: (prompt: string) => void;
  interruptAndSendPrompt: (prompt: string) => Promise<boolean>;
  setPrompt: (prompt?: string) => void;
};

type PromptQueueOptions = {
  appSettings: AppSettings;
  sender: PromptSender;
};

export function usePromptQueue({ appSettings, sender }: PromptQueueOptions) {
  const list = ref<QueueListItem[]>([
    {
      'id':"1",
      content:"2"
    }
  ]);
  const disabledDragListItem = ref(false);
  const isQueuePaused = ref(false);

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

  onMounted(() => {
    watch(
      () => appSettings.enableQueue,
      (enabled) => {
        if (enabled) return;

        list.value = [];
        disabledDragListItem.value = false;
        isQueuePaused.value = false;
      },
    );

    watch(sender.btnStatus, () => {
      if (!appSettings.enableQueue || !list.value?.length || isQueuePaused.value) return;

      if (sender.btnStatus.value == ChatBtnStatus.IDLE) {
        disabledDragListItem.value = true;
        const item = list.value.shift();
        if (item?.content) {
          sender.sendPrompt(item?.content);
        }
        disabledDragListItem.value = false;
      }
    });
  });

  return {
    disabledDragListItem,
    list,
    addPrompt,
    delPrompt: removePrompt,
    editPrompt,
    steerPrompt,
  };
}
