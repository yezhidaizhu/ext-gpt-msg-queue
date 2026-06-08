<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core';
import logoUrl from '@/logo.png';
import QItem from './queue/q-item.vue';
import QueueWin from './queue/win.vue';

import draggable from 'vuedraggable'

const props = withDefaults(defineProps<{
  // 是否禁止拖拽
  disabledDragListItem?: boolean
  showSteer?: boolean
}>(), {
  showSteer: true,
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

const winPosStorage = useLocalStorage('ext-chat-queue-win-pos', {
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
      <div class="relative h-full">
        <div class="h-full px-1 py-2 text-[14px] overflow-y-auto scroll-thin ">
        <draggable v-model="list" item-key="id" tag="ul" class="space-y-1" ghost-class="opacity-40"
          :disabled="disabledDragListItem" drag-class="cursor-grabbing" animation="150" @start="isDragging = true"
          @end="isDragging = false">
          <template #item="{ element }">
            <li>
              <QItem :data="element" :show-steer="showSteer" @guide="$emit('guide', $event)" @del="$emit('del', $event)"
                @edit="$emit('edit', $event)" />
            </li>
          </template>
        </draggable>
        </div>

        <slot name="window-action" />
      </div>
    </QueueWin>
  </Transition>

  <slot v-if="isMinWin" name="minimized-action" />

  <!-- 折叠 win 之后的样式 -->
  <Transition name="fade-in">
    <button v-if="isMinWin" type="button" title="Open Prompt Queue"
      class="group fixed right-4 bottom-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-glass)] shadow-[0_16px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl transition hover:-translate-y-1 hover:scale-105 hover:bg-[var(--bg-glass-hover)]"
      @click="isMinWin = false">
      <img :src="logoUrl" alt="" class="h-[34px] w-[34px] rounded-lg object-cover shadow-sm" />
      <span
        class="absolute -right-1 -top-1 flex size-[18px] items-center justify-center rounded-full bg-[var(--brand-primary)] text-[10px] font-semibold leading-none text-white shadow-sm">
        {{ list.length }}
      </span>
      <span
        class="absolute -bottom-1 h-1 w-5 rounded-full bg-black/30 opacity-70 transition group-hover:w-7 dark:bg-white/50" />
    </button>
  </Transition>
</template>
