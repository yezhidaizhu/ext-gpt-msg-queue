import { onScopeDispose, reactive, watch } from "vue";

export const defaultAppSettings: AppSettings = {
  enableQueue: true,
  keepQueuePerChat: true,
  showSteer: true,
  steerPrompt:
    "Please adjust your response based on this instruction:\n\n{prompt}",
};

const appSettingsStorage = storage.defineItem<AppSettings>(
  "local:queue-settings",
  {
    fallback: defaultAppSettings,
  },
);

export function useAppSettings() {
  const settings = reactive<AppSettings>({ ...defaultAppSettings });

  let ready = false;
  let updatingFromStorage = false;

  appSettingsStorage.getValue().then((value) => {
    Object.assign(settings, defaultAppSettings, value);
    ready = true;
  });

  const stopWatch = watch(
    settings,
    (value) => {
      if (!ready || updatingFromStorage) return;
      appSettingsStorage.setValue({ ...value });
    },
    { deep: true },
  );

  const stopStorageWatch = appSettingsStorage.watch((value) => {
    updatingFromStorage = true;
    Object.assign(settings, defaultAppSettings, value);
    updatingFromStorage = false;
  });

  onScopeDispose(() => {
    stopWatch();
    stopStorageWatch();
  });

  return settings;
}
