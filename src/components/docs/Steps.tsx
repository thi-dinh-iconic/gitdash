"use client";

export function Steps({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative space-y-0 pl-8">
      {/* Vertical line */}
      <div className="absolute left-3.5 top-5 bottom-5 w-px bg-slate-700/60" />
      {children}
    </div>
  );
}

export function Step({
  title,
  children,
  step,
}: {
  title: string;
  children: React.ReactNode;
  step?: number;
}) {
  return (
    <div className="relative pb-8 last:pb-0">
      {/* Circle with number */}
      <div className="absolute -left-8 flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 border-2 border-violet-500/40 text-xs font-bold text-white shrink-0">
        {step ?? "•"}
      </div>
      <div className="pt-0.5 space-y-2">
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <div className="text-sm text-slate-400 leading-relaxed space-y-3">{children}</div>
      </div>
    </div>
  );
}

/** Convenience wrapper that auto-numbers steps */
export function NumberedSteps({ items }: { items: { title: string; content: React.ReactNode }[] }) {
  return (
    <Steps>
      {items.map((item, i) => (
        <Step key={i} title={item.title} step={i + 1}>
          {item.content}
        </Step>
      ))}
    </Steps>
  );
}
