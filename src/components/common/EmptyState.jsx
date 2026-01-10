import React from "react";
import { Button } from "@/components/ui/button";

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-6">
          <Icon className="w-8 h-8 text-slate-500" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-slate-400 max-w-md mb-6">{description}</p>
      )}
      <div className="flex items-center gap-3">
        {actionLabel && onAction && (
          <Button onClick={onAction} className="bg-blue-600 hover:bg-blue-700">
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button variant="outline" onClick={onSecondaryAction} className="border-slate-700 text-slate-300 hover:bg-slate-800">
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}