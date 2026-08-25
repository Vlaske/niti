import { USER_AGENT } from "./paths";

const DEFAULT_DELAY_MS = 350;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Site sometimes prepends HTML junk before JSON — strip to first JSON token. */
export function extractJsonPayload(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return trimmed;

  const obj = trimmed.indexOf("{");
  const arr = trimmed.indexOf("[");
  let start = -1;
  if (obj >= 0 && arr >= 0) start = Math.min(obj, arr);
  else start = Math.max(obj, arr);

  if (start < 0) {
    throw new Error("Response did not contain JSON");
  }
  return trimmed.slice(start);
}

export async function fetchText(
  url: string,
  init?: RequestInit
): Promise<{ text: string; headers: Headers; status: number }> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json, text/plain, */*",
      "User-Agent": USER_AGENT,
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  return { text, headers: res.headers, status: res.status };
}

export async function fetchJson<T>(
  url: string,
  opts?: { delayMs?: number; retries?: number }
): Promise<{ data: T; headers: Headers }> {
  const delayMs = opts?.delayMs ?? DEFAULT_DELAY_MS;
  const retries = opts?.retries ?? 4;
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { text, headers, status } = await fetchText(url);
      if (status >= 500 || status === 429) {
        throw new Error(`HTTP ${status}`);
      }
      if (status >= 400) {
        throw new Error(`HTTP ${status}: ${text.slice(0, 200)}`);
      }
      const data = JSON.parse(extractJsonPayload(text)) as T;
      await sleep(delayMs);
      return { data, headers };
    } catch (err) {
      lastError = err;
      const backoff = delayMs * attempt * 2;
      console.warn(
        `  retry ${attempt}/${retries} for ${url} — ${String(err)} (wait ${backoff}ms)`
      );
      await sleep(backoff);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(String(lastError ?? "fetch failed"));
}
