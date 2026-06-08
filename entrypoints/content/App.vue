<script setup lang="ts">
import QueueContainer from '@/components/QueueContainer.vue';
import QueueResumeButton from '@/components/queue/resume-button.vue';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useChatStatus } from '@/hooks/useChatStatus';
import { useColorMode } from '@/hooks/useColorMode';
import { useConversationRoute } from '@/hooks/useConversationRoute';
import { usePromptQueue } from '@/hooks/usePromptQueue';
import { getAiPlatformAdapter } from '@/platforms';
import { nextTick, watch } from 'vue';

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
const queuesByConversationKey = new Map<string, QueueListItem[]>();
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

watch(
  list,
  (value) => {
    if (restoringQueue) return;

    queuesByConversationKey.set(activeConversationKey, [...value]);
  },
  { deep: true },
);

watch(
  () => appSettings.enableQueue,
  (enabled) => {
    if (enabled) return;
    queuesByConversationKey.clear();
  },
);

watch(conversationKey, async (nextKey, prevKey) => {
  pauseQueue();

  queuesByConversationKey.set(prevKey, [...list.value]);

  activeConversationKey = nextKey;

  if (appSettings.keepQueuePerChat) {
    restoringQueue = true;
    list.value = queuesByConversationKey.get(nextKey) ?? [];
    await nextTick();
    restoringQueue = false;

    if (!appSettings.resumeQueueOnChatReturn && list.value.length) {
      return;
    }
  } else {
    queuesByConversationKey.clear();
    clearQueue();
    return;
  }

  await nextTick();
  resumeQueue();
});

useColorMode({
  target: props.shadowRoot?.querySelector?.('body')
});


</script>
<template>
  <QueueContainer v-if="appSettings.enableQueue && list.length" v-model:list="list" :disabledDragListItem="disabledDragListItem"
    :show-steer="appSettings.showSteer" @guide="steerPrompt" @del="delPrompt" @edit="editPrompt">
    <template v-if="isQueuePaused && isQueueWaiting" #window-action>
      <QueueResumeButton @click="resumeQueue" />
    </template>
    <template v-if="isQueuePaused && isQueueWaiting" #minimized-action>
      <QueueResumeButton variant="minimized" @click="resumeQueue" />
    </template>
  </QueueContainer>
</template>
