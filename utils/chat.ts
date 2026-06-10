type AiPlatformInput = HTMLTextAreaElement | HTMLElement;

function dispatchInputEvents(input: AiPlatformInput): void {
  input.dispatchEvent(
    new InputEvent("beforeinput", {
      bubbles: true,
      cancelable: true,
      data: input.textContent,
      inputType: "insertText",
    }),
  );
  input.dispatchEvent(
    new InputEvent("input", { bubbles: true, inputType: "insertText" }),
  );
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function setTextAreaValue(input: HTMLTextAreaElement, prompt: string): void {
  const descriptor = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value",
  );

  if (descriptor?.set) {
    descriptor.set.call(input, prompt);
    return;
  }

  input.value = prompt;
}

function setContentEditableValue(input: HTMLElement, prompt: string): void {
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(input);
  selection?.removeAllRanges();
  selection?.addRange(range);

  if (document.execCommand("delete") && (!prompt || document.execCommand("insertText", false, prompt))) {
    return;
  }

  input.replaceChildren();

  if (!prompt) return;

  const paragraph = document.createElement("p");
  paragraph.textContent = prompt;
  input.append(paragraph);
}

export function fillPromptInput(input: AiPlatformInput, prompt: string): void {
  input.focus();

  if (input instanceof HTMLTextAreaElement) {
    setTextAreaValue(input, prompt);
  } else if (input.isContentEditable) {
    setContentEditableValue(input, prompt);
  } else {
    input.textContent = prompt;
  }

  dispatchInputEvents(input);
}
