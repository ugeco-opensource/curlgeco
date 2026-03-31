import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { endpoint, model, messages, temperature, max_tokens, top_p, stream } = payload ?? {};

    if (!endpoint?.baseUrl || !endpoint?.apiKey) {
      return NextResponse.json({ error: "Missing endpoint configuration" }, { status: 400 });
    }

    const url = `${endpoint.baseUrl.replace(/\/$/, "")}/chat/completions`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${endpoint.apiKey}`,
      ...(endpoint.headers ?? {}),
    };

    const body = JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens,
      top_p,
      stream,
    });

    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(errorText || "Upstream request failed", {
        status: response.status,
        headers: {
          "Content-Type": response.headers.get("content-type") ?? "text/plain; charset=utf-8",
        },
      });
    }

    if (stream) {
      if (!response.body) {
        return NextResponse.json({ error: "Streaming not supported" }, { status: 500 });
      }
      return new Response(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const text = await response.text();
    return new Response(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}
