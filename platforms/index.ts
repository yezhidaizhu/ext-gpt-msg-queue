import { deepseekAdapter } from "./deepseek";
import type { AiPlatformAdapter } from "./types";

export const aiPlatformAdapters = [deepseekAdapter];
export const aiPlatformMatches = aiPlatformAdapters.flatMap(
  (adapter) => adapter.matches,
);

function matchPattern(url: string, pattern: string) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  const regexp = new RegExp(`^${escaped.replace(/\*/g, ".*")}$`);
  return regexp.test(url);
}

export function getAiPlatformAdapter(
  url = location.href,
): AiPlatformAdapter | undefined {
  return aiPlatformAdapters.find((adapter) =>
    adapter.matches.some((pattern) => matchPattern(url, pattern)),
  );
}

export type { AiPlatformAdapter };
