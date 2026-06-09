import { useLocalStorage } from "@vueuse/core";

type StoredPromptQueue = {
  items: QueueListItem[];
  updatedAt: number;
};

type PromptQueueStorageV1 = {
  version: 1;
  queuesByConversationKey: Record<string, StoredPromptQueue>;
};

const createDefaultPromptQueueStorage = (): PromptQueueStorageV1 => ({
  version: 1,
  queuesByConversationKey: {},
});

export function usePromptQueueStorage() {
  const storage = useLocalStorage<PromptQueueStorageV1>(
    "ext-gpt-msg-queue:prompt-queues:v1",
    createDefaultPromptQueueStorage(),
  );

  const getQueue = (conversationKey: string) => {
    return [...(storage.value.queuesByConversationKey[conversationKey]?.items ?? [])];
  };

  const setQueue = (conversationKey: string, items: QueueListItem[]) => {
    storage.value = {
      version: 1,
      queuesByConversationKey: {
        ...storage.value.queuesByConversationKey,
        [conversationKey]: {
          items: [...items],
          updatedAt: Date.now(),
        },
      },
    };
  };

  const clearQueue = (conversationKey: string) => {
    const { [conversationKey]: _removed, ...queuesByConversationKey } =
      storage.value.queuesByConversationKey;

    storage.value = {
      version: 1,
      queuesByConversationKey,
    };
  };

  const clearAllQueues = () => {
    storage.value = createDefaultPromptQueueStorage();
  };

  return {
    clearAllQueues,
    clearQueue,
    getQueue,
    setQueue,
  };
}
