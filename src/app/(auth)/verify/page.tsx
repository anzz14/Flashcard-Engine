import Link from "next/link";

export default function VerifyPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4">
      <div className="max-w-md rounded-2xl border border-white/10 bg-[#151515] p-6 text-center">
        <h1 className="text-2xl font-bold text-[#ff6a3d]">Verification complete</h1>
        <p className="mt-2 text-sm text-white">
          Your account has been verified. You can sign in and continue studying.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-full bg-[#ff6a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ff5220]"
        >
          Go to login
        </Link>
      </div>
    </main>
  );
}
