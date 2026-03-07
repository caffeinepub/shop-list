import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutGrid, LogOut, Menu, ShoppingCart, User } from "lucide-react";
import { useState } from "react";
import { useGetCallerUserProfile } from "../hooks/useGetCallerUserProfile";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { to: "/projects", label: "Projekty", icon: LayoutGrid },
  { to: "/shopping-lists", label: "Listy zakupowe", icon: ShoppingCart },
];

function NavLink({
  item,
  onClick,
  mobile,
}: {
  item: NavItem;
  onClick?: () => void;
  mobile?: boolean;
}) {
  const location = useLocation();
  const isActive =
    location.pathname === item.to ||
    (item.to === "/projects" && location.pathname === "/");

  if (mobile) {
    return (
      <Link
        to={item.to}
        onClick={onClick}
        data-ocid={`nav.${item.to.replace("/", "").replace("-", "_") || "projects"}.link`}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        }`}
      >
        <item.icon className="w-4 h-4 shrink-0" />
        {item.label}
      </Link>
    );
  }

  return (
    <Link
      to={item.to}
      data-ocid={`nav.${item.to.replace("/", "").replace("-", "_") || "projects"}.link`}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      }`}
    >
      {item.label}
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: "/" });
  };

  const initials = userProfile?.name
    ? userProfile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="no-print sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            data-ocid="nav.home.link"
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-6 h-6 bg-foreground rounded-sm flex items-center justify-center">
              <span className="text-background text-xs font-bold font-display">
                S
              </span>
            </div>
            <span className="font-bold text-base font-display tracking-tight text-foreground">
              Shop List
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 ml-6">
            {navItems.map((item) => (
              <NavLink key={item.to} item={item} />
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {userProfile && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center">
                  <span className="text-foreground text-xs font-semibold font-display">
                    {initials}
                  </span>
                </div>
                <span className="text-sm text-foreground font-medium hidden lg:block">
                  {userProfile.name}
                </span>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              data-ocid="nav.logout.button"
              className="hidden sm:flex text-muted-foreground hover:text-foreground h-8 px-2"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              <span className="text-xs">Wyloguj</span>
            </Button>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-8 w-8"
                  data-ocid="nav.mobile_menu.button"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 p-6">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-foreground rounded-sm flex items-center justify-center">
                      <span className="text-background text-xs font-bold">
                        S
                      </span>
                    </div>
                    <span className="font-bold font-display">Shop List</span>
                  </div>

                  {userProfile && (
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                      <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {userProfile.name}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {userProfile.role}
                        </p>
                      </div>
                    </div>
                  )}

                  <nav className="flex flex-col gap-1">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.to}
                        item={item}
                        mobile
                        onClick={() => setMobileOpen(false)}
                      />
                    ))}
                  </nav>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="mt-auto"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2" />
                    Wyloguj
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-border bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Shop List</span>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              window.location.hostname,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Zbudowano z ❤️ używając caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
