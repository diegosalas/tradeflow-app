import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/common/PageHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import TradeCard from "@/components/trade/TradeCard";
import EmptyState from "@/components/common/EmptyState";
import {
  Plus,
  Activity,
  FileCheck,
  Clock,
  AlertTriangle,
  TrendingUp,
  Package,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: trades = [], isLoading } = useQuery({
    queryKey: ["trades"],
    queryFn: () => base44.entities.Trade.list("-created_date", 50)
  });

  const stats = {
    total: trades.length,
    active: trades.filter(t => !["completed", "payment_failed", "draft"].includes(t.status)).length,
    completed: trades.filter(t => t.status === "completed").length,
    pending: trades.filter(t => ["compliance_check", "finance_pending", "payment_pending"].includes(t.status)).length
  };

  const recentTrades = trades.slice(0, 6);
  const activeTrades = trades.filter(t => !["completed", "payment_failed", "draft"].includes(t.status));
  const pendingActions = trades.filter(t => ["compliance_check", "finance_pending", "payment_pending"].includes(t.status));

  const handleCreateTrade = () => {
    navigate(createPageUrl("TradeAssistant"));
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="My Space"
        description="Manage your international trade operations from one unified dashboard"
        actions={
          <Button 
            onClick={handleCreateTrade}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            New Trade
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Trades"
          value={stats.total}
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="Active"
          value={stats.active}
          icon={Activity}
          color="cyan"
        />
        <StatsCard
          title="Completed"
          value={stats.completed}
          icon={FileCheck}
          color="emerald"
        />
        <StatsCard
          title="Pending Action"
          value={stats.pending}
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="recent" className="space-y-6">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger value="recent" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            Recent Trades
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            Active ({activeTrades.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            Pending Actions ({pendingActions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="bg-slate-900/50 border-slate-800 animate-pulse">
                  <CardContent className="p-6 h-48" />
                </Card>
              ))}
            </div>
          ) : recentTrades.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent>
                <EmptyState
                  icon={Sparkles}
                  title="Start your first trade"
                  description="Use the Trade Assistant to create your first international trade with AI-powered guidance"
                  actionLabel="Create Trade"
                  onAction={handleCreateTrade}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentTrades.map(trade => (
                <TradeCard key={trade.id} trade={trade} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          {activeTrades.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent>
                <EmptyState
                  icon={Activity}
                  title="No active trades"
                  description="All your trades are either completed or in draft status"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTrades.map(trade => (
                <TradeCard key={trade.id} trade={trade} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {pendingActions.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent>
                <EmptyState
                  icon={Clock}
                  title="No pending actions"
                  description="You're all caught up! No trades require your attention right now"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingActions.map(trade => (
                <Card key={trade.id} className="bg-slate-900/50 border-slate-800 hover:border-amber-500/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{trade.title || trade.trade_id}</p>
                          <p className="text-sm text-slate-400">
                            {trade.status === "compliance_check" && "Awaiting compliance review"}
                            {trade.status === "finance_pending" && "Review finance offers"}
                            {trade.status === "payment_pending" && "Execute payment"}
                          </p>
                        </div>
                      </div>
                      <Link to={createPageUrl(`TradeDetail?id=${trade.id}`)}>
                        <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-1">
                          Take Action
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}