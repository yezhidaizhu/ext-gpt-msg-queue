import { ChatBtnStatus } from "@/types/chat";
import { fillPromptInput } from "@/utils/chat";
import { querySelector } from "@/utils/dom";
import type { AiPlatformAdapter } from "./types";

const selectors = {
  input: `.ds-virtual-list div:not(.ds-virtual-list-items) textarea`,
  sendButton: `.ds-virtual-list div:not(.ds-virtual-list-items) .ds-button:has(path[d^="M8.3125 0.981587"])`,
  stopButton: `.ds-virtual-list div:not(.ds-virtual-list-items) .ds-button:has(path[d^="M2 4.88C2 3.68009"])`,
};

export const deepseekAdapter: AiPlatformAdapter = {
  id: "deepseek",
  matches: ["*://*.deepseek.com/*"],
  getInput() {
    return querySelector<HTMLTextAreaElement>(selectors.input);
  },
  getStatus() {
    if (!this.getInput()) return ChatBtnStatus.UNKOWN;
    return querySelector(selectors.stopButton) ? ChatBtnStatus.GENERATING : ChatBtnStatus.IDLE;
  },
  clickSend() {
    querySelector<HTMLButtonElement>(selectors.sendButton)?.click();
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
    const input = this.getInput();
    if (input instanceof HTMLTextAreaElement) return input.value;
    return input?.textContent || "";
  },
};
