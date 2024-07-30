import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json({
        code: "ERROR",
        message: "Unauthorized",
      });
    }

    const { newMessage } = await request.json();

    const savedMessage = await prisma.message.create({
      data: {
        role: newMessage.role,
        content: newMessage.content,
        userId: session.user.id,
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

export const GET = async () => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json({
        code: "ERROR",
        message: "Unauthorized",
      });
    }

    const messages = await prisma.message.findMany({
      where: { userId: session.user.id },
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

export const DELETE = async () => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json({
        code: "ERROR",
        message: "Unauthorized",
      });
    }

    await prisma.message.deleteMany({
      where: { userId: session.user.id },
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
