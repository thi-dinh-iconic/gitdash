"use client";

import { Info, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type CalloutType = "info" | "warning" | "danger" | "success";

const STYLES: Record<CalloutType, {
  bg: string;
  border: string;
  icon: React.ElementType;
  iconColor: string;
  label: string;
}> = {
  info: {
    bg: "bg-blue-500/8",
    border: "border-blue-500/25",
    icon: Info,
    iconColor: "text-blue-400",
    label: "Note",
  },
  warning: {
    bg: "bg-amber-500/8",
    border: "border-amber-500/25",
    icon: AlertTriangle,
    iconColor: "text-amber-400",
    label: "Warning",
  },
  danger: {
    bg: "bg-red-500/8",
    border: "border-red-500/25",
    icon: XCircle,
    iconColor: "text-red-400",
    label: "Danger",
  },
  success: {
    bg: "bg-emerald-500/8",
    border: "border-emerald-500/25",
    icon: CheckCircle,
    iconColor: "text-emerald-400",
    label: "Tip",
  },
};

export function Callout({
  type = "info",
  title,
  children,
}: {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}) {
  const s = STYLES[type];
  const Icon = s.icon;

  return (
    <div className={cn("flex gap-3 rounded-xl border px-4 py-3.5 text-sm", s.bg, s.border)}>
      <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", s.iconColor)} />
      <div className="space-y-1 text-slate-300 leading-relaxed">
        {title && <p className={cn("font-semibold", s.iconColor)}>{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}
