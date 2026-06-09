import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await db.post.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, name: true, screenName: true, image: true } },
      team: { select: { id: true, screenName: true, name: true } },
      comments: {
        include: {
          author: { select: { id: true, name: true, screenName: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      stars: { where: { userId: session.user.id } },
      _count: { select: { stars: true, comments: true } },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...post,
    isStarred: post.stars.length > 0,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await db.post.findUnique({ where: { id: params.id } });
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (post.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, bodyMd, tags, category, wip, message } = await req.json();

  // Count revisions
  const revisionCount = await db.revision.count({ where: { postId: post.id } });

  const updated = await db.post.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(bodyMd !== undefined ? { bodyMd, body: bodyMd } : {}),
      ...(tags !== undefined
        ? { tags: Array.isArray(tags) ? tags.join(",") : tags }
        : {}),
      ...(category !== undefined ? { category } : {}),
      ...(wip !== undefined ? {
        wip,
        publishedAt: wip === false && !post.publishedAt ? new Date() : post.publishedAt,
      } : {}),
      updatedAt: new Date(),
    },
    include: {
      author: { select: { id: true, name: true, screenName: true, image: true } },
    },
  });

  // Save revision
  await db.revision.create({
    data: {
      postId: post.id,
      number: revisionCount + 1,
      body: updated.body,
      bodyMd: updated.bodyMd,
      message: message || null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await db.post.findUnique({ where: { id: params.id } });
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (post.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.post.delete({ where: { id: params.id } });
  return NextResponse.json({ deleted: true });
}
