export const saveMessage = async (request: {
  body: { newMessage: { role: string; content: string } };
}) => {
  const { body, ...options } = request;
  const response = await fetch("/api/message", {
    method: "POST",
    body: JSON.stringify(body),
    ...options,
  });

  const json = await response.json();

  return json;
};

export const fetchMessages = async () => {
  const response = await fetch(`/api/message`);
  const json = await response.json();
  return json;
};

export const deleteMessages = async () => {
  const response = await fetch("/api/message", {
    method: "DELETE",
  });

  const json = await response.json();

  return json;
};
