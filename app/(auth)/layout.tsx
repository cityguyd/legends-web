import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left panel — image (hidden on mobile) */}
      <div
        className="relative hidden lg:block lg:w-1/2"
        style={{
          backgroundImage: `url('/images/auth-panel.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
        }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/10 to-black/50" />
        <div className="absolute bottom-0 left-0 right-0 p-10 pr-12">
          <blockquote className="font-serif text-lg italic leading-relaxed text-amber-100">
            &ldquo;The more that you read, the more things you will know.{" "}
            The more that you learn, the more places you&apos;ll go.&rdquo;
          </blockquote>
          <p className="mt-3 text-sm text-amber-200/70">— History&apos;s accumulated wisdom</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full flex-col items-center justify-center overflow-y-auto bg-bg px-4 py-16 lg:w-1/2">
        <div className="mb-6 w-full max-w-sm">
          <Link href="/" className="text-sm font-semibold text-gold-dark hover:underline">
            ← Back to Legends Library
          </Link>
        </div>
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card px-8 py-10 shadow-sm" style={{ minHeight: '420px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
