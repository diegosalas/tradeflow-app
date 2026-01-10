import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, trendUp, color = "blue" }) {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20",
    emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20",
    purple: "from-purple-500/20 to-purple-600/5 border-purple-500/20",
    amber: "from-amber-500/20 to-amber-600/5 border-amber-500/20",
    cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20"
  };

  const iconColors = {
    blue: "text-blue-400 bg-blue-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
    purple: "text-purple-400 bg-purple-500/10",
    amber: "text-amber-400 bg-amber-500/10",
    cyan: "text-cyan-400 bg-cyan-500/10"
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
            <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                <span>{trendUp ? '↑' : '↓'}</span>
                <span>{trend}</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={`p-3 rounded-xl ${iconColors[color]}`}>
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}