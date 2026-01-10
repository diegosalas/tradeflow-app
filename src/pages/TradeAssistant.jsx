import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/common/PageHeader";
import {
  Send,
  Bot,
  User,
  Loader2,
  Globe,
  Package,
  DollarSign,
  Building2,
  Calendar,
  Truck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  HelpCircle
} from "lucide-react";
import { format } from "date-fns";

const generateTradeId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "TRD-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const EXAMPLE_PROMPTS = [
  "I want to export 5000 units of electronic components from Germany to the USA worth $250,000",
  "Ship organic coffee beans from Colombia to Canada, 10 tons, CIF Vancouver",
  "Import automotive parts from Japan to Mexico, $150,000 FOB Tokyo"
];

export default function TradeAssistant() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your Trade Assistant. Describe the trade you want to create, and I'll help you structure it with all necessary details.",
      type: "text"
    }
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [tradePlan, setTradePlan] = useState(null);
  const [currentTradeId, setCurrentTradeId] = useState(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createTradeMutation = useMutation({
    mutationFn: async (tradeData) => {
      const trade = await base44.entities.Trade.create(tradeData);
      
      // Create trade plan
      await base44.entities.TradePlan.create({
        trade_id: tradeData.trade_id,
        raw_input: input,
        parsed_data: tradeData,
        confidence_score: tradePlan?.confidence || 85,
        pending_questions: tradePlan?.pending_questions || [],
        reasoning: tradePlan?.reasoning || "",
        status: "confirmed"
      });

      // Create audit event
      await base44.entities.AuditEvent.create({
        event_id: `EVT-${Date.now()}`,
        trade_id: tradeData.trade_id,
        event_type: "trade.created",
        details: { trade_id: tradeData.trade_id }
      });

      return trade;
    },
    onSuccess: (trade) => {
      queryClient.invalidateQueries(["trades"]);
      navigate(createPageUrl(`TradeDetail?id=${trade.id}`));
    }
  });

  const parseTrade = async (userInput) => {
    setIsProcessing(true);
    
    // Add user message
    setMessages(prev => [...prev, { role: "user", content: userInput, type: "text" }]);
    
    // Simulate processing
    setMessages(prev => [...prev, { role: "assistant", content: "Analyzing your trade request...", type: "text", isLoading: true }]);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a trade planning assistant. Parse the following trade description and extract structured data.

User Input: "${userInput}"

Extract and return a JSON object with:
- exporter_country: country exporting goods
- importer_country: country importing goods
- product: product description
- product_hs_code: HS code if identifiable (or "TBD")
- incoterm: detected incoterm (EXW, FOB, CIF, DAP, etc.) or suggest one
- estimated_amount: numeric value
- currency: currency code (default USD)
- exporter_name: company name if mentioned
- importer_name: company name if mentioned
- shipping_date: estimated date if mentioned (YYYY-MM-DD format)
- confidence: 0-100 confidence score
- pending_questions: array of clarifying questions if info is missing
- reasoning: brief explanation of the trade structure
- risk_factors: potential risk factors for this trade`,
        response_json_schema: {
          type: "object",
          properties: {
            exporter_country: { type: "string" },
            importer_country: { type: "string" },
            product: { type: "string" },
            product_hs_code: { type: "string" },
            incoterm: { type: "string" },
            estimated_amount: { type: "number" },
            currency: { type: "string" },
            exporter_name: { type: "string" },
            importer_name: { type: "string" },
            shipping_date: { type: "string" },
            confidence: { type: "number" },
            pending_questions: { type: "array", items: { type: "string" } },
            reasoning: { type: "string" },
            risk_factors: { type: "array", items: { type: "string" } }
          }
        }
      });

      const parsed = response;
      const tradeId = generateTradeId();
      setCurrentTradeId(tradeId);
      setTradePlan(parsed);

      // Remove loading message and add trade plan
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        return [...filtered, {
          role: "assistant",
          content: "I've analyzed your trade request. Here's the structured plan:",
          type: "trade_plan",
          data: { ...parsed, trade_id: tradeId }
        }];
      });
    } catch (error) {
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        return [...filtered, {
          role: "assistant",
          content: "I encountered an issue parsing your request. Please try describing your trade again with more details.",
          type: "error"
        }];
      });
    }

    setIsProcessing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    
    parseTrade(input);
    setInput("");
  };

  const handleConfirmTrade = () => {
    if (!tradePlan || !currentTradeId) return;

    const tradeData = {
      trade_id: currentTradeId,
      status: "planning",
      title: `${tradePlan.product} - ${tradePlan.exporter_country} to ${tradePlan.importer_country}`,
      exporter_country: tradePlan.exporter_country,
      importer_country: tradePlan.importer_country,
      product: tradePlan.product,
      product_hs_code: tradePlan.product_hs_code,
      incoterm: tradePlan.incoterm,
      estimated_amount: tradePlan.estimated_amount,
      currency: tradePlan.currency || "USD",
      exporter_name: tradePlan.exporter_name,
      importer_name: tradePlan.importer_name,
      shipping_date: tradePlan.shipping_date,
      current_step: 1
    };

    createTradeMutation.mutate(tradeData);
  };

  const handleExampleClick = (example) => {
    setInput(example);
    inputRef.current?.focus();
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <PageHeader
        title="Trade Assistant"
        description="Describe your trade in natural language and I'll help you structure it"
      />

      <Card className="bg-slate-900/50 border-slate-800 mb-4">
        <CardContent className="p-0">
          {/* Chat Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                  ${message.role === "user" 
                    ? "bg-blue-500/20 text-blue-400" 
                    : "bg-slate-800 text-slate-400"
                  }
                `}>
                  {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "text-right" : ""}`}>
                  {message.type === "trade_plan" && message.data ? (
                    <TradePlanCard 
                      data={message.data} 
                      onConfirm={handleConfirmTrade}
                      isConfirming={createTradeMutation.isPending}
                    />
                  ) : (
                    <div className={`
                      inline-block px-4 py-3 rounded-2xl text-sm
                      ${message.role === "user"
                        ? "bg-blue-600 text-white"
                        : message.type === "error"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-slate-800 text-slate-200"
                      }
                      ${message.isLoading ? "animate-pulse" : ""}
                    `}>
                      {message.isLoading && (
                        <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                      )}
                      {message.content}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Example Prompts */}
          {messages.length <= 2 && (
            <div className="px-6 pb-4 border-t border-slate-800 pt-4">
              <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Try an example
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg transition-colors text-left"
                  >
                    {example.substring(0, 50)}...
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800">
            <div className="flex gap-3">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your trade (e.g., Export 1000 units of electronics from USA to Germany...)"
                className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                disabled={isProcessing}
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || isProcessing}
                className="bg-blue-600 hover:bg-blue-700 px-6"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function TradePlanCard({ data, onConfirm, isConfirming }) {
  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base text-white">Trade Plan</CardTitle>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
              {data.trade_id}
            </Badge>
          </div>
          <Badge 
            variant="outline" 
            className={`
              ${data.confidence >= 80 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                : data.confidence >= 60 
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }
            `}
          >
            {data.confidence}% confident
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Route */}
        <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
          <Globe className="w-5 h-5 text-blue-400" />
          <span className="text-white font-medium">{data.exporter_country}</span>
          <ArrowRight className="w-4 h-4 text-slate-500" />
          <span className="text-white font-medium">{data.importer_country}</span>
          {data.incoterm && (
            <Badge variant="outline" className="ml-auto bg-purple-500/10 text-purple-400 border-purple-500/20">
              {data.incoterm}
            </Badge>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-900/50 rounded-lg">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Package className="w-3 h-3" /> Product
            </div>
            <p className="text-white text-sm">{data.product}</p>
            {data.product_hs_code && (
              <p className="text-slate-500 text-xs mt-1">HS: {data.product_hs_code}</p>
            )}
          </div>
          <div className="p-3 bg-slate-900/50 rounded-lg">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <DollarSign className="w-3 h-3" /> Value
            </div>
            <p className="text-white text-sm">{formatCurrency(data.estimated_amount, data.currency)}</p>
          </div>
          {data.exporter_name && (
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Building2 className="w-3 h-3" /> Exporter
              </div>
              <p className="text-white text-sm">{data.exporter_name}</p>
            </div>
          )}
          {data.importer_name && (
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Building2 className="w-3 h-3" /> Importer
              </div>
              <p className="text-white text-sm">{data.importer_name}</p>
            </div>
          )}
        </div>

        {/* Reasoning */}
        {data.reasoning && (
          <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-slate-300">{data.reasoning}</p>
          </div>
        )}

        {/* Pending Questions */}
        {data.pending_questions?.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-amber-400 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> Additional information needed:
            </p>
            <ul className="space-y-1">
              {data.pending_questions.map((q, i) => (
                <li key={i} className="text-sm text-slate-400 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-slate-600">
                  {q}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risk Factors */}
        {data.risk_factors?.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Risk factors:
            </p>
            <div className="flex flex-wrap gap-2">
              {data.risk_factors.map((risk, i) => (
                <Badge key={i} variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">
                  {risk}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button 
            onClick={onConfirm}
            disabled={isConfirming}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirm & Create Trade
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}