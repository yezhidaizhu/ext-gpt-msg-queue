<script setup lang="ts">
import { Pause, Play } from '@lucide/vue';

withDefaults(defineProps<{
  paused?: boolean
  variant?: 'header' | 'minimized'
}>(), {
  paused: false,
  variant: 'header',
});

defineEmits<{
  toggle: []
}>();
</script>

<template>
  <button type="button" :title="paused ? 'Resume queue' : 'Pause queue'"
    class="z-10 border backdrop-blur-xl transition hover:bg-[var(--bg-glass-hover)]"
    :class="[
      paused
        ? 'border-[var(--error)]/35 bg-[var(--error)]/10 text-[var(--error)]'
        : 'border-[var(--success)]/35 bg-[var(--success)]/10 text-[var(--success)]',
      variant === 'header'
        ? 'flex h-5 items-center gap-1 rounded-full px-1.5 text-[11px] font-medium leading-none'
        : 'fixed bottom-20 right-4 grid h-9 w-9 place-items-center rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.18)]',
    ]"
    @click="$emit('toggle')">
    <Play v-if="paused" :size="variant === 'header' ? 10 : 16" :fill="'currentColor'" />
    <Pause v-else :size="variant === 'header' ? 10 : 16" :fill="'currentColor'" />
    <span v-if="variant === 'header'">
      {{ paused ? 'Paused' : 'Running' }}
    </span>
  </button>
</template>
