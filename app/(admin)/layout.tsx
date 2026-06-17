import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="bg-ink px-6 py-3">
        <span className="font-display text-sm font-semibold text-white tracking-wide">
          Legends Library Admin
        </span>
      </header>
      {children}
    </div>
  );
}
