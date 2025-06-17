import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir email girin"),
  password: z.string().min(1, "Şifre gerekli"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: "Email veya şifre hatalı" },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Email veya şifre hatalı" },
        { status: 401 }
      );
    }

    const token = generateToken(user.id);

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: "Giriş başarılı",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri formatı", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Login error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
