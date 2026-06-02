export function getApiBaseUrl() {
  // En dev, el backend corre en 3001.
  // En despliegue, configurar NEXT_PUBLIC_API_BASE (ej: https://api.dominio.com).
  return (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001").replace(
    /\/+$/,
    ""
  );
}

export async function apiJson<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...(init?.headers || {})
    }
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = (await res.json().catch(() => null)) as any;
      const message =
        typeof json?.message === "string"
          ? json.message
          : Array.isArray(json?.message)
            ? json.message.join(", ")
            : null;
      const error =
        typeof json?.error === "string" ? json.error : res.statusText;
      throw new Error(
        `API ${res.status}: ${JSON.stringify(
          {
            ...(message ? { message } : {}),
            ...(error ? { error } : {}),
            statusCode: res.status
          },
          null,
          0
        )}`
      );
    }

    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  return (await res.json()) as T;
}
