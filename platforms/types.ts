import { ChatBtnStatus } from "@/types/chat";

export type AiPlatformInput = HTMLTextAreaElement | HTMLElement;

export type AiPlatformAdapter = {
  id: string;
  matches: string[];
  getInput: () => AiPlatformInput | null;
  getStatus: () => ChatBtnStatus;
  clickSend: () => void;
  clickStop: () => void;
  setPrompt: (prompt: string) => void;
  getPrompt: () => string;
};
