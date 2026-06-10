import { ChatBtnStatus } from "@/types/chat";
import { fillPromptInput } from "@/utils/chat";
import { querySelector } from "@/utils/dom";
import type { AiPlatformAdapter, AiPlatformInput } from "./types";

const selectors = {
  input: `#prompt-textarea, [data-testid="prompt-textarea"]`,
  sendButton: `[data-testid="send-button"]`,
  stopButton: `[data-testid="stop-button"], [data-testid="composer-speech-button"][aria-label*="Stop"]`,
};

function getText(input: AiPlatformInput | null) {
  if (!input) return "";
  if (input instanceof HTMLTextAreaElement) return input.value;
  return input.textContent || "";
}

export const chatgptAdapter: AiPlatformAdapter = {
  id: "chatgpt",
  matches: [
    "*://chatgpt.com/*",
    "*://*.chatgpt.com/*",
    "*://chat.openai.com/*",
  ],
  getInput() {
    return querySelector<AiPlatformInput>(selectors.input);
  },
  getStatus() {
    if (!this.getInput()) return ChatBtnStatus.UNKOWN;
    return querySelector(selectors.stopButton) ? ChatBtnStatus.GENERATING : ChatBtnStatus.IDLE;
  },
  getConversationKey() {
    return `${location.origin}${location.pathname}`;
  },
  clickSend() {
    const sendButton = querySelector<HTMLButtonElement>(selectors.sendButton);
    if (!sendButton || sendButton.disabled || sendButton.getAttribute("aria-disabled") === "true") return false;

    sendButton.click();
    return true;
  },
  clickStop() {
    querySelector<HTMLButtonElement>(selectors.stopButton)?.click();
  },
  setPrompt(prompt: string) {
    const input = this.getInput();
    if (!input) return;
    fillPromptInput(input, prompt);
  },
  getPrompt() {
    return getText(this.getInput());
  },
};
