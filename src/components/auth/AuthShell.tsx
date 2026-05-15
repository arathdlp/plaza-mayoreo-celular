import Link from "next/link";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gradient-to-br from-black via-[#0a1628] to-[#0c2848] px-4 py-16 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, rgba(0,102,255,0.2) 0%, transparent 45%),
            radial-gradient(circle at 85% 80%, rgba(0,102,255,0.12) 0%, transparent 40%)`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px]" />

      <div className="relative z-10 mx-auto w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex text-sm font-medium text-white/60 transition-colors duration-300 hover:text-[#0066FF]"
        >
          ← Volver al inicio
        </Link>
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-8 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-10">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm font-normal leading-relaxed text-white/60">{subtitle}</p>
          ) : null}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export const authFieldClass =
  "mt-1.5 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-normal text-white outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-[#0066FF]/55 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(0,102,255,0.18)]";

export const authLabelClass = "text-sm font-medium text-zinc-300";
