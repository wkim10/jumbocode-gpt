import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
  try {
    const { userId, newMessage } = await request.json();

    const savedMessage = await prisma.message.create({
      data: {
        role: newMessage.role,
        content: newMessage.content,
        userId: userId,
      },
    });

    return NextResponse.json({
      code: "SUCCESS",
      message: savedMessage.content,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({
      code: "ERROR",
      message: error,
    });
  }
};

export const GET = async (request: NextRequest) => {
  try {
    console.log("GET HERE!");
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({
        code: "ERROR",
        message: "Missing userId parameter",
      });
    }

    const messages = await prisma.message.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      code: "SUCCESS",
      message: messages,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({
      code: "ERROR",
      message: error,
    });
  }
};

export const DELETE = async (request: NextRequest) => {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({
        code: "ERROR",
        message: "Missing userId parameter",
      });
    }

    await prisma.message.deleteMany({
      where: { userId: userId },
    });

    return NextResponse.json({
      code: "SUCCESS",
      message: "Messages deleted successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({
      code: "ERROR",
      message: error,
    });
  }
};
