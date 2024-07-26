"use client";

import React from "react";
import markdownit from "markdown-it";
import { getChatCompletion } from "./api/chat/route.client";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  deleteMessages,
  fetchMessages,
  saveMessage,
} from "./api/message/route.client";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const messagesEl = React.useRef<HTMLDivElement>(null);
  const textAreaEl = React.useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = React.useState<
    {
      role: string;
      content: string;
    }[]
  >([]);
  const [copiedMessages, setCopiedMessages] = React.useState<boolean[]>([]);
  const [loadingMessage, setLoadingMessage] = React.useState<boolean>(false);
  const [inputText, setInputText] = React.useState<string>("");

  React.useEffect(() => {
    if (status === "authenticated") {
      const fetchAndSetMessages = async () => {
        if (session.user.id) {
          const messages = await fetchMessages(session.user.id);
          setMessages(messages.message);
        }
      };
      fetchAndSetMessages();
    }
  }, [status, router, session]);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const adjustTextAreaHeight = () => {
    if (textAreaEl.current) {
      textAreaEl.current.style.height = "auto";
      const minHeight = 43;
      const maxHeight = 86;
      const scrollHeight = textAreaEl.current.scrollHeight;
      textAreaEl.current.style.height = `${Math.min(
        Math.max(scrollHeight, minHeight),
        maxHeight
      )}px`;
    }
  };

  const copyToClipboard = (parsedContent: string, index: number) => {
    navigator.clipboard
      .writeText(parsedContent)
      .then(() => {
        console.log("Copied to clipboard");

        setCopiedMessages((prevCopiedMessages) => {
          const updatedCopiedMessages = [...prevCopiedMessages];
          updatedCopiedMessages[index] = true;
          return updatedCopiedMessages;
        });

        setTimeout(() => {
          setCopiedMessages((prevCopiedMessages) => {
            const resetCopiedMessages = [...prevCopiedMessages];
            resetCopiedMessages[index] = false;
            return resetCopiedMessages;
          });
        }, 1000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleUserInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    setInputText((event.target as HTMLInputElement).value);
    adjustTextAreaHeight();
  };

  const resetMessages = async () => {
    if (session?.user.id) {
      try {
        await deleteMessages({ body: { userId: session.user.id } });
        setMessages([]);
      } catch (error) {
        console.error("Failed to reset messages:", error);
      }
    }
  };

  const scrollToBottom = () => {
    if (messagesEl.current) {
      messagesEl.current.scrollTop = messagesEl.current.scrollHeight;
    }
  };

  const sendMessage = async () => {
    if (inputText.trim() === "") return;

    const userMessage = { role: "user", content: inputText };

    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, userMessage];
      setInputText("");

      if (textAreaEl.current) {
        textAreaEl.current.style.height = "43px";
      }

      return updatedMessages;
    });

    try {
      setLoadingMessage(true);

      setTimeout(() => {
        scrollToBottom();
      }, 0);

      const assistantResponse = await getChatCompletion({
        body: { messages: [...messages, { role: "user", content: inputText }] },
      });
      setLoadingMessage(false);

      const assistantMessage = {
        role: "assistant",
        content: assistantResponse.message,
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);

      setTimeout(() => {
        scrollToBottom();
      }, 0);

      const userId = session?.user.id;

      if (userId) {
        await saveMessage({
          body: {
            userId: userId,
            newMessage: userMessage,
          },
        });
        await saveMessage({
          body: {
            userId: userId,
            newMessage: assistantMessage,
          },
        });
      }
    } catch (e) {
      console.error("Error sending message:", e);
      setLoadingMessage(false);

      setTimeout(() => {
        scrollToBottom();
      }, 0);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="flex flex-col justify-center items-center h-screen">
      <div className="flex justify-between items-center w-full px-52 header">
        <div className="font-bold text-2xl capitalize">
          Hi {session?.user.username}!
        </div>
        <button
          className="bg-red-600 border-red-600"
          onClick={() => signOut({ callbackUrl: "/signin" })}
        >
          Sign Out
        </button>
      </div>
      <div className="pageWrapper bg-gray-100 border border-gray-300 rounded-md text-gray-800 flex flex-col h-[calc(100%-180px)] mb-2 mt-4 mx-4 max-h-full overflow-y-auto p-2.5 max-w-[500px] w-full">
        <div
          className="messages bg-white border border-gray-300 rounded-md flex-1 h-full mb-2.5 overflow-y-auto p-2.5"
          ref={messagesEl}
        >
          {messages.map((message, index) => (
            <div key={`${index}`} className="wrapper">
              <div className={`message ${message.role} container`}>
                <div
                  className={`message ${message.role} inner`}
                  dangerouslySetInnerHTML={{
                    __html: markdownit().render(message.content),
                  }}
                />
              </div>
              {message.role === "assistant" ? (
                <div className="flex items-center gap-2.5 mt-1.5">
                  {copiedMessages[index] ? (
                    <div className="copy-wrapper flex items-center gap-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="checkmark text-gray-500 cursor-pointer h-4 w-4"
                        viewBox="0 0 512 512"
                      >
                        <path
                          fill="none"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="32"
                          d="M416 128L192 384l-96-96"
                        />
                      </svg>
                      <div className="copy-text text-gray-500 text-sm leading-none">
                        Copied!
                      </div>
                    </div>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="copy text-gray-500 cursor-pointer h-4 w-4"
                      viewBox="0 0 512 512"
                      onClick={() => copyToClipboard(message.content, index)}
                    >
                      <rect
                        width="336"
                        height="336"
                        x="128"
                        y="128"
                        fill="none"
                        stroke="currentColor"
                        stroke-linejoin="round"
                        stroke-width="32"
                        rx="57"
                        ry="57"
                      />
                      <path
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="32"
                        d="m383.5 128l.5-24a56.16 56.16 0 0 0-56-56H112a64.19 64.19 0 0 0-64 64v216a56.16 56.16 0 0 0 56 56h24"
                      />
                    </svg>
                  )}
                </div>
              ) : null}
            </div>
          ))}
          {loadingMessage ? (
            <div className="message assistant container wrapper">
              <div className="message assistant inner">Loading...</div>
            </div>
          ) : null}
        </div>
        <div className="input-container flex items-center border-t border-gray-300 gap-2.5 pt-2.5">
          <textarea
            ref={textAreaEl}
            className="user-input bg-white border border-gray-300 rounded-sm box-border text-gray-800 flex-1 text-sm mr-2.5 p-2.5 resize-none"
            value={inputText}
            onInput={(event) => handleUserInput(event)}
            onKeyDown={(event) => handleKeyDown(event)}
            placeholder="Type your message..."
            rows={1}
          />
          <button onClick={() => sendMessage()}>Send</button>
        </div>
      </div>
      <button className="mt-4" onClick={resetMessages}>
        Reset
      </button>
    </main>
  );
}
