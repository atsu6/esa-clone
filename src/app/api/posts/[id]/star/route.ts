import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await db.star.findUnique({
    where: { postId_userId: { postId: params.id, userId: session.user.id } },
  });

  if (existing) {
    await db.$transaction([
      db.star.delete({ where: { id: existing.id } }),
      db.post.update({
        where: { id: params.id },
        data: { starCount: { decrement: 1 } },
      }),
    ]);
    return NextResponse.json({ starred: false });
  } else {
    await db.$transaction([
      db.star.create({
        data: { postId: params.id, userId: session.user.id },
      }),
      db.post.update({
        where: { id: params.id },
        data: { starCount: { increment: 1 } },
      }),
    ]);
    return NextResponse.json({ starred: true });
  }
}
