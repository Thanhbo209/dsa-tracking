import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col">
      <DashboardHeader
        user={{
          name: user.name,
          username: user.username,
          email: user.email,
          image: user.image,
        }}
      />
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
