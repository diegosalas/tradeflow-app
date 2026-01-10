import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard,
  MessageSquare,
  Shield,
  Wallet,
  CreditCard,
  FileCheck,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Box
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: "My Space", href: "Dashboard", icon: LayoutDashboard },
  { name: "Trade Assistant", href: "TradeAssistant", icon: MessageSquare },
  { name: "Compliance", href: "Compliance", icon: Shield },
  { name: "Finance", href: "Finance", icon: Wallet },
  { name: "Payments", href: "Payments", icon: CreditCard },
  { name: "Proofs", href: "Proofs", icon: FileCheck },
];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      console.log("User not logged in");
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <style>{`
        :root {
          --primary: 217 91% 60%;
          --primary-foreground: 0 0% 100%;
          --background: 222 47% 4%;
          --foreground: 210 40% 98%;
          --card: 222 47% 7%;
          --card-foreground: 210 40% 98%;
          --border: 217 33% 17%;
          --input: 217 33% 17%;
          --ring: 217 91% 60%;
          --muted: 217 33% 17%;
          --muted-foreground: 215 20% 65%;
          --accent: 217 33% 17%;
          --accent-foreground: 210 40% 98%;
        }
      `}</style>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800
        transform transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
            <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Box className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">TRAIBOX</span>
            </Link>
            <button 
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = currentPageName === item.href;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.href)}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                    transition-all duration-200 group
                    ${isActive 
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  {item.name}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          {user && (
            <div className="p-4 border-t border-slate-800">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 transition-colors">
                    <Avatar className="h-9 w-9 bg-gradient-to-br from-blue-500 to-purple-500">
                      <AvatarFallback className="bg-transparent text-white text-sm font-medium">
                        {user.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white truncate">{user.full_name || 'User'}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800">
                  <DropdownMenuItem className="text-slate-300 focus:bg-slate-800 focus:text-white">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-800" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center h-16 px-4 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800">
          <button 
            className="p-2 text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 ml-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Box className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">TRAIBOX</span>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}