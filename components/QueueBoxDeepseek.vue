<script setup lang="ts">
import { queueBoxId } from '@/config';
import { useIntervalFn } from '@vueuse/core';

const data = ref('text in data')
const showQueueNode = ref(false);
const nodeKey = ref(new Date().getTime());

const exFlagId = 'exFlagId';

onMounted(() => {
  const insetQueueNode = () => {
    const area = document.querySelector('.ds-scroll-area textarea')
    const oldQueueBoxNode = document.getElementById(queueBoxId);

    if (area?.parentNode) {
      if (!oldQueueBoxNode?.querySelector?.(`#${exFlagId}`)) {
        if (oldQueueBoxNode) {
          oldQueueBoxNode.remove();
          showQueueNode.value = false;
          // nodeKey.value = new Date().getTime();
        };

        const div = document.createElement('div');
        div.id = queueBoxId;

        // 添加内容
        area?.parentNode?.insertBefore?.(div, area);
        showQueueNode.value = true;
      }
    } else {
      showQueueNode.value = false;
    }
  };

  useIntervalFn(() => {
    insetQueueNode();
  }, 500);
})
</script>
<template>
  <Teleport :to="`#${queueBoxId}`" :key="nodeKey" v-if="showQueueNode">
    <div :id="exFlagId"></div>
    <slot />
  </Teleport>
</template>