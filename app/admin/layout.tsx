"use client";

import { useAuth } from "@/lib/firebase";
import { isAdmin } from "@/lib/isAdmin";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { LayoutDashboard, Package, ShoppingCart, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-muted">Loading admin area...</p>
      </div>
    );
  }

  if (!user || !isAdmin(user.email)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <h1 className="text-3xl font-bold mb-4">Not authorized</h1>
        <p className="mb-6 text-muted">You do not have permission to view the admin area.</p>
        <Link href="/" className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
          Return to Homepage
        </Link>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  ];

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-background">
      {/* Mobile Top Nav / Sidebar */}
      <aside className="w-full lg:w-64 bg-surface border-b lg:border-b-0 lg:border-r border-border flex flex-col">
        <div className="p-4 lg:p-6 border-b border-border flex items-center justify-between lg:justify-start">
          <Link href="/admin" className="text-xl font-bold text-foreground">
            Admin Panel
          </Link>
          <Link href="/" className="lg:hidden p-2 text-muted hover:text-foreground">
            <LogOut className="h-5 w-5" />
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted hover:bg-surface hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="hidden lg:block p-4 border-t border-border">
          <Link href="/" className="flex items-center gap-3 text-muted hover:text-foreground transition-colors px-3 py-2">
            <LogOut className="h-5 w-5" />
            <span>Back to Store</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
