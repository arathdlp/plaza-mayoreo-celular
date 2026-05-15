import Header from "@/components/Header";

type PrivateChromeProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

export default function PrivateChrome({ title, description, children, actions }: PrivateChromeProps) {
  return (
    <>
      <Header />
      <main className="relative flex-1 overflow-hidden bg-gradient-to-b from-black via-[#0a1628] to-[#0c2848] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 40% at 50% -10%, rgba(0,102,255,0.2), transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl">
          <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.06] p-8 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:flex-row sm:items-start sm:justify-between sm:p-10">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
              {description ? (
                <p className="mt-2 max-w-xl text-sm font-normal leading-relaxed text-white/60">
                  {description}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>
          </div>
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md sm:p-8">
            {children}
          </div>
        </div>
      </main>
    </>
  );
}
