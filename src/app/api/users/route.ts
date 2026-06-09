import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, screenName } = await req.json();

    if (!email || !password || !screenName) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email }, { screenName }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            existingUser.email === email
              ? "Email already registered"
              : "Screen name already taken",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name: name || screenName,
        email,
        password: hashedPassword,
        screenName,
      },
    });

    // Create a default personal team
    const team = await db.team.create({
      data: {
        name: `${user.name}'s Team`,
        screenName: screenName,
        description: "My personal team",
        members: {
          create: {
            userId: user.id,
            role: "owner",
          },
        },
      },
    });

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        screenName: user.screenName,
        defaultTeam: team.screenName,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
