type Props = {
  className?: string;
};

export function BorderBeam({ className = "" }: Props) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] ${className}`}
    >
      <div className="absolute -inset-[1px] rounded-[inherit] bg-[conic-gradient(from_0deg,transparent_0_65%,#0066FF_75%,transparent_85%)] opacity-70 [animation:spin_4s_linear_infinite]" />
      <div className="absolute inset-px rounded-[inherit] bg-white" />
    </div>
  );
}
