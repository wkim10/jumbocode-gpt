export const saveMessage = async (request: {
  body: { userId: string; newMessage: { role: string; content: string } };
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

export const fetchMessages = async (userId: string) => {
  const response = await fetch(
    `/api/message?userId=${encodeURIComponent(userId)}`
  );
  const json = await response.json();
  return json;
};

export const deleteMessages = async (request: { body: { userId: string } }) => {
  const { body, ...options } = request;
  const response = await fetch("/api/message", {
    method: "DELETE",
    body: JSON.stringify(body),
    ...options,
  });

  const json = await response.json();

  return json;
};
