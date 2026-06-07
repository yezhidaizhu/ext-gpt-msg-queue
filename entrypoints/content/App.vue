<script setup lang="ts">
import QueueContainer from '@/components/QueueContainer.vue';
import { DeepseekConfig } from '@/config/chat-textarea';
import { useChatStauts } from '@/hooks/useChatStauts';
import { useColorMode } from '@/hooks/useColorMode';
import { ChatBtnStatus } from '@/types/chat';

const props = withDefaults(defineProps<{
  shadowRoot: ShadowRoot
}>(), {
})

const list = ref<QueueListItem[]>([
  { id: '1', content: '测试' },
  { id: '2', content: '测试 2' },
  { id: '3', content: '测试 7' },
]);

const handleItemAct = {
  guide: (data: QueueListItem) => {
  },
  del: (data: QueueListItem) => {
    list.value = toValue(list).filter(d => d.id != data?.id);
  },
  eidt: (data: QueueListItem) => {
    setTextareaVal(data?.content);
    list.value = toValue(list).filter(d => d.id != data?.id);
  },
}

const disabledDragListItem = ref(false);

const { btnStatus, setTextareaVal, sendPrompt } = useChatStauts(DeepseekConfig, {
  onProcessSend: (val) => {
    if (!val) return;

    list.value.push({
      id: new Date().getTime() + '',
      content: val,
    })
  }
});

onMounted(() => {
  // watch(btnStatus, () => {
  //   if (!list.value?.length) return;

  //   if (btnStatus.value == ChatBtnStatus.IDLE) {
  //     disabledDragListItem.value = true
  //     const item = list.value.shift();
  //     if (item?.content) {
  //       sendPrompt(item?.content)
  //     }
  //     disabledDragListItem.value = false;
  //   }
  // })
})

useColorMode({
  target: props.shadowRoot?.querySelector?.('body')
});


</script>
<template>
  <QueueContainer v-if="list.length" v-model:list="list" :disabledDragListItem="disabledDragListItem"
    @guide="handleItemAct.guide" @del="handleItemAct.del" @edit="handleItemAct.eidt"></QueueContainer>
</template>
