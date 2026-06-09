<script setup lang="ts">
import QueueContainer from '@/components/QueueContainer.vue';
import QueuePauseToggleButton from '@/components/queue/pause-toggle-button.vue';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useChatStatus } from '@/hooks/useChatStatus';
import { useColorMode } from '@/hooks/useColorMode';
import { useConversationRoute } from '@/hooks/useConversationRoute';
import { usePromptQueue } from '@/hooks/usePromptQueue';
import { usePromptQueueStorage } from '@/hooks/usePromptQueueStorage';
import { getAiPlatformAdapter } from '@/platforms';
import { nextTick, onMounted, watch } from 'vue';

const props = withDefaults(defineProps<{
  shadowRoot: ShadowRoot
}>(), {
})

const aiPlatform = getAiPlatformAdapter();
if (!aiPlatform) {
  throw new Error(`Unsupported AI platform: ${location.href}`);
}

const appSettings = useAppSettings();
const { conversationKey } = useConversationRoute(aiPlatform);
const queueStorage = usePromptQueueStorage();
let activeConversationKey = conversationKey.value;
let restoringQueue = false;
let addPromptToQueue = (_val?: string) => {};
const { btnStatus, interruptAndSendPrompt, sendPrompt, setPrompt } = useChatStatus(aiPlatform, {
  appSettings,
  onProcessSend: (val) => {
    addPromptToQueue(val);
  }
});

const { disabledDragListItem, isQueuePaused, isQueueWaiting, list, addPrompt, clearQueue, delPrompt, editPrompt, pauseQueue, resumeQueue, steerPrompt } = usePromptQueue({
  appSettings,
  canAutoSend: () => aiPlatform.getConversationKey() === activeConversationKey,
  getConversationKey: () => conversationKey.value,
  sender: {
    btnStatus,
    interruptAndSendPrompt,
    sendPrompt,
    setPrompt,
  },
});
addPromptToQueue = addPrompt;

const toggleQueuePaused = () => {
  if (isQueuePaused.value) {
    resumeQueue();
    return;
  }

  pauseQueue();
};

const restoreQueue = async (key: string) => {
  restoringQueue = true;
  list.value = queueStorage.getQueue(key);
  await nextTick();
  restoringQueue = false;
};

onMounted(async () => {
  await restoreQueue(activeConversationKey);

  if (list.value.length) {
    pauseQueue();
  }
});

watch(
  list,
  (value) => {
    if (restoringQueue) return;

    if (value.length) {
      queueStorage.setQueue(activeConversationKey, value);
      return;
    }

    queueStorage.clearQueue(activeConversationKey);
  },
  { deep: true },
);

watch(
  () => appSettings.enableQueue,
  (enabled) => {
    if (enabled) return;

    queueStorage.clearAllQueues();
    clearQueue();
  },
);

watch(
  () => appSettings.keepQueuePerChat,
  (enabled) => {
    if (enabled) return;

    queueStorage.clearAllQueues();
    clearQueue();
  },
);

watch(conversationKey, async (nextKey, prevKey) => {
  pauseQueue();

  if (list.value.length) {
    queueStorage.setQueue(prevKey, list.value);
  } else {
    queueStorage.clearQueue(prevKey);
  }

  activeConversationKey = nextKey;

  if (appSettings.keepQueuePerChat) {
    await restoreQueue(nextKey);

    if (!list.value.length) {
      resumeQueue();
    }

    return;
  } else {
    queueStorage.clearAllQueues();
    clearQueue();
    return;
  }
});

useColorMode({
  target: props.shadowRoot?.querySelector?.('body')
});


</script>
<template>
  <QueueContainer v-if="appSettings.enableQueue && list.length" v-model:list="list" :disabledDragListItem="disabledDragListItem"
    :show-steer="appSettings.showSteer" @guide="steerPrompt" @del="delPrompt" @edit="editPrompt">
    <template #header-action>
      <QueuePauseToggleButton :paused="isQueuePaused" @toggle="toggleQueuePaused" />
    </template>
    <template v-if="isQueuePaused && isQueueWaiting" #minimized-action>
      <QueuePauseToggleButton :paused="true" variant="minimized" @toggle="resumeQueue" />
    </template>
  </QueueContainer>
</template>
