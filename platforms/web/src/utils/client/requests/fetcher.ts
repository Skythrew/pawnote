export const fetchAPI = async <T extends {
  request: unknown
  response: unknown
}>(path: string, body: T["request"]): Promise<T["response"]> => {
  const response = await fetch("/api" + path, {
    method: "POST",
    body: JSON.stringify(body)
  });

  const data = await response.json();
  return data.data as T["response"];
};
