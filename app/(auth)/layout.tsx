export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-sm px-8 py-10">
        {children}
      </div>
    </div>
  );
}
