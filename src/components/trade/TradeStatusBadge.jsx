import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  FileEdit,
  ClipboardList,
  Shield,
  Wallet,
  CheckCircle2,
  CreditCard,
  Loader2,
  AlertCircle,
  FileCheck
} from "lucide-react";

const statusConfig = {
  draft: {
    label: "Draft",
    color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    icon: FileEdit
  },
  planning: {
    label: "Planning",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: ClipboardList
  },
  compliance_check: {
    label: "Compliance Check",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    icon: Shield
  },
  finance_pending: {
    label: "Finance Pending",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    icon: Wallet
  },
  finance_accepted: {
    label: "Finance Accepted",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    icon: CheckCircle2
  },
  payment_pending: {
    label: "Payment Pending",
    color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    icon: CreditCard
  },
  payment_executing: {
    label: "Executing Payment",
    color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    icon: Loader2
  },
  payment_completed: {
    label: "Payment Complete",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2
  },
  payment_failed: {
    label: "Payment Failed",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    icon: AlertCircle
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: FileCheck
  }
};

export default function TradeStatusBadge({ status, size = "default" }) {
  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={`
        ${config.color} 
        ${size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"}
        font-medium border
      `}
    >
      <Icon className={`${size === "sm" ? "w-3 h-3" : "w-4 h-4"} mr-1.5 ${status === "payment_executing" ? "animate-spin" : ""}`} />
      {config.label}
    </Badge>
  );
}