import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { EditPostForm } from "./EditPostForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ team: string; number: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { team: teamSlug, number: numberStr } = await params;
  const team = await db.team.findUnique({ where: { screenName: teamSlug } });
  if (!team) redirect("/");

  const post = await db.post.findUnique({
    where: { teamId_number: { teamId: team.id, number: parseInt(numberStr) } },
  });

  if (!post) notFound();
  if (post.authorId !== session.user.id) redirect(`/${teamSlug}/posts/${numberStr}`);

  return <EditPostForm post={post as any} teamScreenName={teamSlug} />;
}
