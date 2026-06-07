<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core';
import QItem from './queue/q-item.vue';
import QueueWin from './queue/win.vue';

import draggable from 'vuedraggable'

const props = withDefaults(defineProps<{
  // 是否禁止拖拽
  disabledDragListItem?: boolean
}>(), {
})

const list = defineModel<{ id: string, content: string }[]>('list', { default: [] });

const emits = defineEmits<{
  guide: [data: QueueListItem]
  del: [data: QueueListItem]
  edit: [data: QueueListItem]
}>()

const isDragging = ref(false); // 拖拽中

const isMinWin = ref(false);
const onMin = () => {
  isMinWin.value = true;
};

const winPosStorage = useLocalStorage('win-pos', {
  right: 8,
  bottom: 8,
  width: 320,
  height: 200
});

const onChgWinPos = (pos: any) => {
  winPosStorage.value = pos;
};

</script>

<template>
  <Transition name="fade-in" appear>
    <QueueWin :init-pos="winPosStorage" :max-win-style="{ height: '100vh', top: '0', right: '0', width: '400px' }"
      v-if="!isMinWin" @mini-win="onMin" @close-win="list = []" @chg-pos="onChgWinPos">
      <div class="h-full px-1 py-2 text-[14px] overflow-y-auto scroll-thin ">
        <draggable v-model="list" item-key="id" tag="ul" class="space-y-1" ghost-class="opacity-40"
          :disabled="disabledDragListItem" drag-class="cursor-grabbing" animation="150" @start="isDragging = true"
          @end="isDragging = false">
          <template #item="{ element }">
            <li>
              <QItem :data="element" @guide="$emit('guide', $event)" @del="$emit('del', $event)"
                @edit="$emit('edit', $event)" />
            </li>
          </template>
        </draggable>
      </div>
    </QueueWin>
  </Transition>

  <Transition name="fade-in">
    <button v-if="isMinWin"
      class="fixed right-4 bottom-4 flex size-14 items-center justify-center rounded-lg bg-[var(--brand-primary)] text-4xl text-[var(--text-inverse)] shadow-lg"
      @click="isMinWin = false">
      sd
    </button>
  </Transition>
</template>
