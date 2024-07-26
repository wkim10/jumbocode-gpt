import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  try {
    const messages = (await request.json()).messages;
    const systemsMessage = {
      role: "system",
      content:
        "You are an assistant who is also a Pikmin expert who always references Pikmin at the end of your answers.",
    };
    messages.unshift(systemsMessage);

    return fetch(
      "https://tl-onboarding-project-dxm7krgnwa-uc.a.run.app/login",
      {
        method: "POST",
        body: JSON.stringify({
          username: "won",
          password: "Statement3-Thumb-We",
        }),
      }
    )
      .then((res) => res.json())
      .then((res) => {
        return fetch(
          "https://tl-onboarding-project-dxm7krgnwa-uc.a.run.app/prompt",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${res.token}`,
            },
            body: JSON.stringify({
              model: "gpt-4o",
              messages: messages,
            }),
          }
        );
      })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        return NextResponse.json({
          code: "SUCCESS",
          message: res.message.content,
        });
      })
      .catch((error) => {
        console.error("Error:", error);
        return NextResponse.json({
          code: "ERROR",
          message: error,
        });
      });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({
      code: "ERROR",
      message: error,
    });
  }
};
