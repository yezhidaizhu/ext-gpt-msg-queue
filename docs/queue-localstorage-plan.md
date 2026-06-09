# 持久化 Queue 到 localStorage

## Summary
- 使用 VueUse `useLocalStorage` 持久化队列。
- 页面刷新后恢复队列，但默认暂停。
- 切回会话后恢复队列，但默认暂停，不自动发送。

## Key Changes
- 新增 `usePromptQueueStorage`：
  - key：`ext-gpt-msg-queue:prompt-queues:v1`
  - 数据结构：
    ```ts
    type PromptQueueStorageV1 = {
      version: 1;
      queuesByConversationKey: Record<string, {
        items: QueueListItem[];
        updatedAt: number;
      }>;
    };
    ```

- 调整 `content/App.vue`：
  - 初始化读取当前 conversation queue。
  - 刷新恢复后执行 `pauseQueue()`。
  - `list` 变化同步写入 storage。
  - `Prompt Queue=false` 立即清空当前队列和所有 storage queue。
  - `Keep Queue per Chat=false` 立即清空当前队列和所有 storage queue。

- 队列恢复规则：
  - 刷新恢复：恢复当前会话队列，并暂停。
  - 切回恢复：恢复目标会话队列，并暂停。
  - 只有用户点击恢复按钮后才继续发送。

## Test Plan
- A 有队列，刷新后仍显示，且暂停。
- 刷新后从 A 切 B，B 不自动发送。
- A 运行中切 B，再切回 A，A 队列恢复但暂停。
- `Prompt Queue=false` 立即清空当前队列和所有持久化队列。
- `Keep Queue per Chat=false` 立即清空当前队列和所有持久化队列。
- `pnpm compile` 通过。

## Assumptions
- 不兼容旧数据。
- 刷新恢复永远暂停。
- 切回恢复永远暂停。
- storage 只存队列，不存暂停状态。
