export const getChatCompletion = async (request: {
  body: { messages: { role: string; content: string }[] };
}) => {
  const { body, ...options } = request;
  const response = await fetch("/api/chat", {
    method: "POST",
    body: JSON.stringify(body),
    ...options,
  });

  const json = await response.json();

  return json;
};
