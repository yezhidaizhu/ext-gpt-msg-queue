# Prompt Queue for DeepSeek & ChatGPT

Queue, pause, reorder, and steer prompts for DeepSeek and ChatGPT chats.

## Features

- Queue prompts while the AI is responding.
- Keep separate queues for each chat.
- Store queues locally and restore them after refresh.
- Pause by default after refresh or chat return to avoid accidental token use.
- Resume manually from the queue window.
- Steer the current reply with a configurable prompt template.
- Edit, delete, and reorder queued prompts.
- Switch popup theme between auto, light, and dark.

## Supported Sites

- DeepSeek Chat
- ChatGPT

## Behavior

- Turning off `Prompt Queue` clears all queued prompts.
- Turning off `Keep Queue per Chat` clears all queued prompts.
- Restored queues are paused until manually resumed.
- Queue data is stored locally in the browser.

## Development

```bash
pnpm install
pnpm compile
pnpm build
```
