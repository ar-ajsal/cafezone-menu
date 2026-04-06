import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Store, 
  List, 
  UtensilsCrossed, 
  Tags, 
  QrCode,
  LogOut,
  Menu,
  Settings,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/restaurant", icon: Store, label: "Restaurant" },
  { href: "/admin/categories", icon: List, label: "Categories" },
  { href: "/admin/items", icon: UtensilsCrossed, label: "Menu Items" },
  { href: "/admin/offers", icon: Tags, label: "Offers" },
  { href: "/admin/qr", icon: QrCode, label: "QR Code" },
  { href: "/admin/setup", icon: Settings, label: "Setup" },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    // Check session storage on mount
    if (sessionStorage.getItem("cafezone_admin_auth") === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "sadath321") {
      sessionStorage.setItem("cafezone_admin_auth", "true");
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPasswordInput("");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("cafezone_admin_auth");
    setIsAuthenticated(false);
    setLocation("/menu/1");
  };

  const NavLinks = () => (
    <>
      <div className="space-y-1 py-4">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? "bg-primary text-primary-foreground font-medium" 
                  : "text-muted-foreground hover:bg-muted"
              }`}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-card border rounded-2xl p-8 shadow-sm text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Admin Access</h1>
          <p className="text-muted-foreground mb-8">Enter your password to continue.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className={error ? "border-destructive focus-visible:ring-destructive" : ""}
                autoFocus
              />
              {error && <p className="text-sm text-destructive text-left">Incorrect password. Please try again.</p>}
            </div>
            <Button type="submit" className="w-full">
              Enter Admin Panel
            </Button>
          </form>
          
          <div className="mt-8">
            <Link href="/menu/1" className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors">
              Return to Customer Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
        <div className="font-bold text-lg text-primary flex items-center gap-2">
          <UtensilsCrossed className="w-6 h-6" />
          MenuAdmin
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] p-0">
            <div className="p-4 border-b font-bold text-lg text-primary flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6" />
              MenuAdmin
            </div>
            <div className="px-2">
              <NavLinks />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r bg-card h-screen sticky top-0">
        <div className="p-6 border-b">
          <div className="font-bold text-2xl text-primary flex items-center gap-2">
            <UtensilsCrossed className="w-7 h-7" />
            MenuAdmin
          </div>
        </div>
        <div className="flex-1 px-3 overflow-y-auto">
          <NavLinks />
        </div>
        <div className="p-4 border-t">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            Exit Admin
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}