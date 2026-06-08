<script setup lang="ts">
import QueueContainer from '@/components/QueueContainer.vue';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useChatStatus } from '@/hooks/useChatStatus';
import { useColorMode } from '@/hooks/useColorMode';
import { usePromptQueue } from '@/hooks/usePromptQueue';
import { getAiPlatformAdapter } from '@/platforms';

const props = withDefaults(defineProps<{
  shadowRoot: ShadowRoot
}>(), {
})

const aiPlatform = getAiPlatformAdapter();
if (!aiPlatform) {
  throw new Error(`Unsupported AI platform: ${location.href}`);
}

const appSettings = useAppSettings();
let addPromptToQueue = (_val?: string) => {};
const { btnStatus, interruptAndSendPrompt, sendPrompt, setPrompt } = useChatStatus(aiPlatform, {
  appSettings,
  onProcessSend: (val) => {
    addPromptToQueue(val);
  }
});

const { disabledDragListItem, list, addPrompt, delPrompt, editPrompt, steerPrompt } = usePromptQueue({
  appSettings,
  sender: {
    btnStatus,
    interruptAndSendPrompt,
    sendPrompt,
    setPrompt,
  },
});
addPromptToQueue = addPrompt;

useColorMode({
  target: props.shadowRoot?.querySelector?.('body')
});


</script>
<template>
  <QueueContainer v-if="appSettings.enableQueue && list.length" v-model:list="list" :disabledDragListItem="disabledDragListItem"
    :show-steer="appSettings.showSteer" @guide="steerPrompt" @del="delPrompt" @edit="editPrompt"></QueueContainer>
</template>
