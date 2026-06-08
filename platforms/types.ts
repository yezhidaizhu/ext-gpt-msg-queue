import { ChatBtnStatus } from "@/types/chat";

export type AiPlatformInput = HTMLTextAreaElement | HTMLElement;

export type AiPlatformAdapter = {
  id: string;
  matches: string[];
  getInput: () => AiPlatformInput | null;
  getStatus: () => ChatBtnStatus;
  getConversationKey: () => string;
  clickSend: () => boolean;
  clickStop: () => void;
  setPrompt: (prompt: string) => void;
  getPrompt: () => string;
};
