type QueueListItem = {
  id: string;
  content: string;
};

type AppSettings = {
  enableQueue: boolean;
  keepQueuePerChat: boolean;
  showSteer: boolean;
  steerPrompt: string;
};

type ColorMode = "light" | "dark" | "auto";
