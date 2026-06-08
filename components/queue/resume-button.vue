<script setup lang="ts">
import { Play } from '@lucide/vue';

withDefaults(defineProps<{
  variant?: 'window' | 'minimized'
}>(), {
  variant: 'window',
});

defineEmits<{
  click: []
}>();
</script>

<template>
  <Transition name="fade-in">
    <button type="button" title="Resume queue"
      class="z-10 grid h-9 w-9  cursor-pointer place-items-center rounded-full border border-[var(--border-glass)] bg-[var(--bg-glass)] text-[var(--brand-primary)] shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl transition hover:bg-[var(--bg-glass-hover)]"
      :class="variant === 'window' ? 'absolute bottom-3 right-3' : 'fixed bottom-20 right-4'"
      @click="$emit('click')">
      <Play :size="16" :fill="'currentColor'" />
    </button>
  </Transition>
</template>
