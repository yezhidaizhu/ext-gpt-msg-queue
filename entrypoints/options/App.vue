<script lang="ts" setup>
import QueueContainer from '@/components/QueueContainer.vue';

const list = ref<QueueListItem[]>([
  { id: '1', content: '测试数据测试数据测试数据测试数据测试数据测试数据测试数据测试数据' },
  { id: '2', content: '测试 2' },
  { id: '3', content: '测试 7' },
  // { id: '4', content: '测试 8' },
  // { id: '5', content: '测试 9' },
  // { id: '6', content: '测试 10' },
]);


const val = ref();

// 回车处理函数
function handleEnter(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()

    list.value.push({
      id: '' + new Date().getTime(),
      content: val.value,
    })
    val.value = ''
  }
}

const handleItemAct = {
  guide: (data: QueueListItem) => {
  },
  del: (data: QueueListItem) => {
    list.value = toValue(list).filter(d => d.id != data?.id);
  },
  eidt: (data: QueueListItem) => {
    val.value = data?.content;
    list.value = toValue(list).filter(d => d.id != data?.id);
  },
}

</script>

<template>
  <QueueContainer v-if="list.length" v-model:list="list" @guide="handleItemAct.guide" @del="handleItemAct.del"
    @edit="handleItemAct.eidt"></QueueContainer>
    
  <textarea class=" border w-[600px] h-[300px] text-lg p-2 " v-model="val" @keydown="handleEnter"></textarea>
</template>
