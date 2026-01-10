import React from "react";
import {
  MessageSquare,
  Shield,
  Wallet,
  CreditCard,
  FileCheck,
  Check,
  Loader2
} from "lucide-react";

const steps = [
  { id: 1, name: "Plan", icon: MessageSquare, status_match: ["draft", "planning"] },
  { id: 2, name: "Compliance", icon: Shield, status_match: ["compliance_check"] },
  { id: 3, name: "Finance", icon: Wallet, status_match: ["finance_pending", "finance_accepted"] },
  { id: 4, name: "Payment", icon: CreditCard, status_match: ["payment_pending", "payment_executing", "payment_completed", "payment_failed"] },
  { id: 5, name: "Proof", icon: FileCheck, status_match: ["completed"] }
];

const getStepStatus = (step, currentStatus) => {
  const statusOrder = [
    "draft", "planning", "compliance_check", 
    "finance_pending", "finance_accepted",
    "payment_pending", "payment_executing", "payment_completed",
    "completed"
  ];
  
  const currentIndex = statusOrder.indexOf(currentStatus);
  
  // Find which step the current status belongs to
  const currentStepIndex = steps.findIndex(s => s.status_match.includes(currentStatus));
  
  if (step.id < currentStepIndex + 1) return "complete";
  if (step.id === currentStepIndex + 1) return "current";
  return "upcoming";
};

export default function TradeSteps({ currentStatus }) {
  return (
    <div className="w-full">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, stepIdx) => {
            const status = getStepStatus(step, currentStatus);
            
            return (
              <li 
                key={step.name} 
                className={`flex items-center ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      relative flex h-12 w-12 items-center justify-center rounded-full
                      transition-all duration-300
                      ${status === "complete" 
                        ? "bg-emerald-500/20 border-2 border-emerald-500" 
                        : status === "current"
                          ? "bg-blue-500/20 border-2 border-blue-500"
                          : "bg-slate-800 border-2 border-slate-700"
                      }
                    `}
                  >
                    {status === "complete" ? (
                      <Check className="w-5 h-5 text-emerald-400" />
                    ) : status === "current" ? (
                      <step.icon className="w-5 h-5 text-blue-400" />
                    ) : (
                      <step.icon className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <span 
                    className={`
                      mt-2 text-xs font-medium
                      ${status === "complete" 
                        ? "text-emerald-400" 
                        : status === "current"
                          ? "text-blue-400"
                          : "text-slate-500"
                      }
                    `}
                  >
                    {step.name}
                  </span>
                </div>
                
                {stepIdx !== steps.length - 1 && (
                  <div 
                    className={`
                      flex-1 h-0.5 mx-4 mt-[-1.5rem]
                      ${status === "complete" 
                        ? "bg-emerald-500" 
                        : "bg-slate-700"
                      }
                    `}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}