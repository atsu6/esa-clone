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

  const { bodyMd } = await req.json();
  if (!bodyMd?.trim()) {
    return NextResponse.json({ error: "Comment body required" }, { status: 400 });
  }

  const post = await db.post.findUnique({ where: { id: params.id } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const [comment] = await db.$transaction([
    db.comment.create({
      data: {
        postId: post.id,
        authorId: session.user.id,
        bodyMd,
        body: bodyMd,
      },
      include: {
        author: { select: { id: true, name: true, screenName: true, image: true } },
      },
    }),
    db.post.update({
      where: { id: post.id },
      data: { commentCount: { increment: 1 } },
    }),
  ]);

  return NextResponse.json(comment, { status: 201 });
}
