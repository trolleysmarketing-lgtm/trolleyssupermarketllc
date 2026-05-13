export function adminHeaders(extra?: HeadersInit): HeadersInit {
  const token = typeof window !== "undefined" 
    ? (localStorage.getItem("admin_token") ?? "") 
    : "";
  return {
    ...(extra ?? {}),
    ...(token ? { "x-admin-token": token } : {}),
  };
}

export async function adminFetch(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      ...adminHeaders(),
    },
  });
}