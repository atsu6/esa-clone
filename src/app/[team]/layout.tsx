import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { TeamLayout } from "@/components/layout/TeamLayout";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { team: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const team = await db.team.findUnique({
    where: { screenName: params.team },
    include: {
      members: {
        where: { userId: session.user.id },
        include: { user: true },
      },
    },
  });

  if (!team || team.members.length === 0) {
    redirect("/");
  }

  return (
    <TeamLayout team={team} user={session.user}>
      {children}
    </TeamLayout>
  );
}
