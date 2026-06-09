<script lang="ts" setup>
import { Info, Settings } from '@lucide/vue';
import { ref } from 'vue';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useColorMode } from '@/hooks/useColorMode';
import logoUrl from '@/logo.png';

const mode = useColorMode();
const appSettings = useAppSettings();
const isSteerDialogOpen = ref(false);
const steerPromptDraft = ref('');

const openSteerDialog = () => {
  steerPromptDraft.value = appSettings.steerPrompt;
  isSteerDialogOpen.value = true;
};

const saveSteerPrompt = () => {
  const value = steerPromptDraft.value.trim();
  appSettings.steerPrompt = value.includes('{prompt}')
    ? value
    : `${value}\n\n{prompt}`.trim();
  isSteerDialogOpen.value = false;
};

const themes = [
  { value: 'auto', icon: '◐' },
  { value: 'light', icon: '☀︎' },
  { value: 'dark', icon: '☾' },
] as const;
</script>

<template>
  <div class="h-[400px] w-[300px] overflow-y-auto bg-[var(--bg-secondary)] text-[var(--text-primary)] scroll-thin">
    <div class="flex h-11 items-center gap-2 px-3">
      <img :src="logoUrl" alt="" class="h-5 w-5 object-contain" />
      <div class="min-w-0">
        <div class="truncate text-[15px] font-semibold leading-5">
          Prompt Queue
        </div>
      </div>
    </div>

    <div class="space-y-4 px-3 pb-3">
      <section class="space-y-1.5">
        <div class="px-1 text-[11px] font-semibold uppercase text-[var(--text-tertiary)]">
          Appearance
        </div>
        <div class="rounded-lg border border-[var(--border-light)] bg-[var(--bg-primary)]">
        <div class="flex h-11 items-center justify-between px-3">
          <span class="text-sm">Theme</span>

          <div class="flex rounded-md bg-[var(--bg-tertiary)] p-0.5">
            <button v-for="item in themes" :key="item.value"
              class="grid h-6 w-8 place-items-center rounded text-sm transition-colors"
              :class="mode === item.value
                ? 'bg-[var(--bg-primary)] text-[var(--brand-primary)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'" @click="mode = item.value">
              {{ item.icon }}
            </button>
          </div>
        </div>
      </div>
      </section>

      <section class="space-y-1.5">
        <div class="px-1 text-[11px] font-semibold uppercase text-[var(--text-tertiary)]">
          Queue
        </div>
        <div class="rounded-lg border border-[var(--border-light)] bg-[var(--bg-primary)]">
        <div class="flex h-11 items-center justify-between rounded-t-lg px-3">
          <div class="flex items-center gap-1.5">
            <span class="text-sm">Prompt Queue</span>
            <span class="group relative grid h-5 w-5 place-items-center">
              <Info :size="13" class="text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]" />
              <span
                class="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden w-52 -translate-x-1/2 rounded border border-[var(--border-tooltip)] bg-[var(--bg-tooltip)] px-2 py-1 text-center text-xs text-[var(--text-tooltip)] shadow-lg group-hover:block">
                Queues prompts while AI is responding. Turning off clears all queues.
              </span>
            </span>
          </div>

          <button class="relative h-5 w-9 rounded-full"
            :class="appSettings.enableQueue ? 'bg-[var(--brand-primary)]' : 'bg-[var(--bg-tertiary)]'"
            @click="appSettings.enableQueue = !appSettings.enableQueue">
            <span class="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-[var(--color-white)] transition-transform"
              :class="appSettings.enableQueue ? 'translate-x-4' : ''" />
          </button>
        </div>

        <div v-if="appSettings.enableQueue"
          class="flex h-11 items-center justify-between rounded-b-lg border-t border-[var(--border-light)] px-3">
          <div class="flex items-center gap-1.5">
            <span class="text-sm">Keep Queue per Chat</span>
            <span class="group relative grid h-5 w-5 place-items-center">
              <Info :size="13" class="text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]" />
              <span
                class="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden w-52 -translate-x-1/2 rounded border border-[var(--border-tooltip)] bg-[var(--bg-tooltip)] px-2 py-1 text-center text-xs text-[var(--text-tooltip)] shadow-lg group-hover:block">
                Keeps a separate queue for each chat. Turning off clears all queues.
              </span>
            </span>
          </div>

          <button class="relative h-5 w-9 rounded-full"
            :class="appSettings.keepQueuePerChat ? 'bg-[var(--brand-primary)]' : 'bg-[var(--bg-tertiary)]'"
            @click="appSettings.keepQueuePerChat = !appSettings.keepQueuePerChat">
            <span class="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-[var(--color-white)] transition-transform"
              :class="appSettings.keepQueuePerChat ? 'translate-x-4' : ''" />
          </button>
        </div>

      </div>
      </section>

      <section class="space-y-1.5">
        <div class="px-1 text-[11px] font-semibold uppercase text-[var(--text-tertiary)]">
          Steer
        </div>
        <div class="rounded-lg border border-[var(--border-light)] bg-[var(--bg-primary)]">
        <div class="flex h-11 items-center justify-between px-3">
          <span class="text-sm">Show Steer</span>

          <div class="flex items-center gap-1.5">
            <button v-if="appSettings.showSteer"
              class="grid h-7 w-7 place-items-center rounded text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              title="Edit steer prompt" @click="openSteerDialog">
              <Settings :size="16" :stroke-width="2" />
            </button>

            <button class="relative h-5 w-9 rounded-full"
              :class="appSettings.showSteer ? 'bg-[var(--brand-primary)]' : 'bg-[var(--bg-tertiary)]'"
              @click="appSettings.showSteer = !appSettings.showSteer">
              <span class="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-[var(--color-white)] transition-transform"
                :class="appSettings.showSteer ? 'translate-x-4' : ''" />
            </button>
          </div>
        </div>
      </div>
      </section>
    </div>

    <div v-if="isSteerDialogOpen"
      class="fixed inset-0 flex items-center justify-center bg-black/30 px-4">
      <div class="w-full rounded-lg border border-[var(--border-light)] bg-[var(--bg-primary)] shadow-lg">
        <div class="border-b border-[var(--border-light)] px-3 py-2 text-sm font-semibold">
          Steer prompt
        </div>

        <div class="p-3">
          <textarea v-model="steerPromptDraft"
            class="h-28 w-full resize-none rounded-md border border-[var(--border-medium)] bg-[var(--bg-secondary)] p-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
            placeholder="Use {prompt} as the queued prompt placeholder" />
        </div>

        <div class="flex justify-end gap-2 border-t border-[var(--border-light)] px-3 py-2">
          <button class="rounded-md px-3 py-1.5 text-xs hover:bg-[var(--bg-hover)]"
            @click="isSteerDialogOpen = false">
            Cancel
          </button>
          <button class="rounded-md bg-[var(--brand-primary)] px-3 py-1.5 text-xs text-white"
            @click="saveSteerPrompt">
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
