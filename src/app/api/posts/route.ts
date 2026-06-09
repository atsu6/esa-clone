import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const teamScreenName = searchParams.get("team");
  const q = searchParams.get("q") || "";
  const wip = searchParams.get("wip");
  const tag = searchParams.get("tag");
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("per_page") || "20");

  if (!teamScreenName) {
    return NextResponse.json({ error: "Team required" }, { status: 400 });
  }

  const team = await db.team.findUnique({
    where: { screenName: teamScreenName },
    include: {
      members: { where: { userId: session.user.id } },
    },
  });

  if (!team || team.members.length === 0) {
    return NextResponse.json({ error: "Not found or no access" }, { status: 404 });
  }

  const where: any = {
    teamId: team.id,
    ...(wip !== null ? { wip: wip === "true" } : {}),
    ...(q ? { OR: [
      { title: { contains: q } },
      { body: { contains: q } },
      { tags: { contains: q } },
    ]} : {}),
    ...(tag ? { tags: { contains: tag } } : {}),
  };

  const [posts, total] = await Promise.all([
    db.post.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, screenName: true, image: true } },
        _count: { select: { comments: true, stars: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.post.count({ where }),
  ]);

  return NextResponse.json({
    posts,
    meta: {
      total,
      page,
      per_page: perPage,
      total_pages: Math.ceil(total / perPage),
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { teamScreenName, title, bodyMd, tags, category, wip, message } =
    await req.json();

  const team = await db.team.findUnique({
    where: { screenName: teamScreenName },
    include: {
      members: { where: { userId: session.user.id } },
    },
  });

  if (!team || team.members.length === 0) {
    return NextResponse.json({ error: "Not found or no access" }, { status: 403 });
  }

  // Get next post number for team
  const lastPost = await db.post.findFirst({
    where: { teamId: team.id },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const nextNumber = (lastPost?.number ?? 0) + 1;

  const post = await db.post.create({
    data: {
      number: nextNumber,
      teamId: team.id,
      authorId: session.user.id,
      title: title || "No title",
      bodyMd: bodyMd || "",
      body: bodyMd || "", // In production you'd convert MD→HTML here
      tags: Array.isArray(tags) ? tags.join(",") : (tags || ""),
      category: category || null,
      wip: wip !== false,
      message: message || null,
      publishedAt: wip === false ? new Date() : null,
    },
    include: {
      author: { select: { id: true, name: true, screenName: true, image: true } },
    },
  });

  // Create initial revision
  await db.revision.create({
    data: {
      postId: post.id,
      number: 1,
      body: post.body,
      bodyMd: post.bodyMd,
      message: message || "Initial version",
    },
  });

  return NextResponse.json(post, { status: 201 });
}
