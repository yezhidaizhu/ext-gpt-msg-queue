// composables/useColorMode.ts
import { onScopeDispose, ref, unref, watch, type MaybeRef } from "vue";

type ColorMode = "light" | "dark" | "auto";
type StorageKey = `local:${string}` | `session:${string}` | `sync:${string}`;

interface UseColorModeOptions {
  target?: MaybeRef<HTMLElement | null | undefined>;
  initialValue?: ColorMode;
  storageKey?: StorageKey;
}

export function useColorMode(options: UseColorModeOptions = {}) {
  const {
    target,
    initialValue = "auto",
    storageKey = "local:color-mode",
  } = options;

  const mode = ref<ColorMode>(initialValue);

  const storageItem = storage.defineItem<ColorMode>(storageKey, {
    fallback: initialValue,
  });

  let ready = false;
  let updatingFromStorage = false;

  function getTarget() {
    return unref(target) ?? document.documentElement;
  }

  function applyMode(value = mode.value) {
    const el = getTarget();

    const isDark =
      value === "dark" ||
      (value === "auto" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    el.classList.toggle("dark", isDark);
    el.classList.toggle("light", !isDark);
  }

  storageItem.getValue().then((value) => {
    mode.value = value;
    ready = true;
    applyMode(value);
  });

  const stopModeWatch = watch(
    mode,
    (value) => {
      applyMode(value);

      if (!ready || updatingFromStorage) return;

      storageItem.setValue(value);
    },
    { immediate: true },
  );

  const stopStorageWatch = storageItem.watch((value) => {
    if (value === mode.value) return;

    updatingFromStorage = true;
    mode.value = value;
    updatingFromStorage = false;

    applyMode(value);
  });

  const media = window.matchMedia("(prefers-color-scheme: dark)");

  const handleSystemChange = () => {
    if (mode.value === "auto") applyMode();
  };

  media.addEventListener("change", handleSystemChange);

  onScopeDispose(() => {
    stopModeWatch();
    stopStorageWatch();
    media.removeEventListener("change", handleSystemChange);
  });

  return mode;
}
