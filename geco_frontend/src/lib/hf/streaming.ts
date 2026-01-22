export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: () => void;
  onError: (error: string) => void;
}

export async function readChatStream(
  response: Response,
  { onToken, onComplete, onError }: StreamCallbacks
) {
  if (!response.body) {
    onError("No response body");
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;
        const payload = trimmed.replace(/^data:\s*/, "");
        if (payload === "[DONE]") {
          onComplete();
          return;
        }
        try {
          const parsed = JSON.parse(payload);
          const delta = parsed?.choices?.[0]?.delta?.content ?? "";
          if (delta) onToken(delta);
        } catch {
          onError("Failed to parse stream chunk");
        }
      }
    }
    onComplete();
  } catch (error) {
    onError(error instanceof Error ? error.message : "Stream error");
  }
}
