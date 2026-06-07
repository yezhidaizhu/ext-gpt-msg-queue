<script lang="ts" setup>
import { ref } from 'vue';
import { useColorMode } from '@/hooks/useColorMode';

const mode = useColorMode();
const enabled = ref(true);

const themes = [
  { value: 'auto', icon: '◐' },
  { value: 'light', icon: '☀︎' },
  { value: 'dark', icon: '☾' },
] as const;
</script>

<template>
  <div class="h-[400px] w-[300px] bg-[var(--bg-primary)] text-[var(--text-primary)]">
    <div class="px-3 py-2 text-sm font-semibold">
      Prompt Queue
    </div>

    <div class="border-t border-[var(--border-light)]">
      <div class="flex h-11 items-center justify-between px-3">
        <span class="text-sm">Theme</span>

        <div class="flex gap-1">
          <button v-for="item in themes" :key="item.value" class="grid h-7 w-7 place-items-center rounded text-sm"
            :class="mode === item.value
              ? 'bg-[var(--bg-tertiary)] text-[var(--brand-primary)]'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'" @click="mode = item.value">
            {{ item.icon }}
          </button>
        </div>
      </div>

      <div class="flex h-11 items-center justify-between border-t border-[var(--border-light)] px-3">
        <span class="text-sm">Enable queue</span>

        <button class="relative h-5 w-9 rounded-full"
          :class="enabled ? 'bg-[var(--brand-primary)]' : 'bg-[var(--bg-tertiary)]'" @click="enabled = !enabled">
          <span class="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-[var(--color-white)] transition-transform"
            :class="enabled ? 'translate-x-4' : ''" />
        </button>
      </div>
    </div>
  </div>
</template>