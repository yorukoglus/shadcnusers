import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }
    const { userId, role } = await request.json();
    if (!userId || !role) {
      return NextResponse.json({ error: "Eksik veri" }, { status: 400 });
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
