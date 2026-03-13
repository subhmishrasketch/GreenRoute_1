import { Recycle, LogOut, User, Building2, Bell, Trophy, Coins, Users, BookOpen, Home, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navLinks = [
  { path: "/", label: "Home", icon: Home },
  { path: "/rewards", label: "Rewards", icon: Coins },
  { path: "/community", label: "Community", icon: Users },
  { path: "/education", label: "Learn", icon: BookOpen },
];

export function Header() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const getRoleBadge = () => {
    if (role === "admin") {
      return (
        <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">
          MBMC Admin
        </Badge>
      );
    }
    return (
      <Badge className="bg-success/10 text-success border-success/30 text-xs">
        Society Caretaker
      </Badge>
    );
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 md:h-16 items-center justify-between px-3 md:px-6 gap-2">
        {/* Logo */}
        <button onClick={() => navigate("/welcome")} className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity shrink-0 min-w-0">
          <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl gradient-eco shadow-soft shrink-0">
            <Recycle className="h-4.5 w-4.5 md:h-5 md:w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm md:text-lg font-bold text-foreground tracking-tight leading-tight whitespace-nowrap">
              Green<span className="text-primary">Route</span>
            </h1>
            <p className="text-[10px] md:text-[11px] text-muted-foreground leading-none hidden sm:block">{t("city")}</p>
          </div>
        </button>

        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          {/* Desktop Nav */}
          {user && (
            <nav className="hidden lg:flex items-center gap-0.5 bg-muted/50 rounded-xl p-1 border border-border/60">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    isActive(link.path)
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <link.icon className="h-3.5 w-3.5" />
                  {link.label}
                </button>
              ))}
            </nav>
          )}

          <div className="hidden md:flex items-center gap-1">
            <LanguageSelector />
            <ThemeToggle />
          </div>
          {user && <NotificationBell />}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full p-0">
                  <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-primary/20 shadow-soft">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent text-accent-foreground font-semibold text-xs md:text-sm">
                      {getInitials(user.email || "U")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-xl shadow-elevated border-border/50" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-medium leading-none truncate">{user.email}</p>
                    {getRoleBadge()}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Mobile/tablet nav links */}
                <div className="lg:hidden">
                  {navLinks.map((link) => (
                    <DropdownMenuItem
                      key={link.path}
                      onClick={() => navigate(link.path)}
                      className={cn("rounded-lg cursor-pointer", isActive(link.path) && "bg-accent")}
                    >
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </div>
                <DropdownMenuItem onClick={() => navigate("/profile")} className="rounded-lg cursor-pointer">
                  <Trophy className="mr-2 h-4 w-4" />
                  Profile & Achievements
                </DropdownMenuItem>
                {role === "society_caretaker" && (
                  <DropdownMenuItem onClick={() => navigate("/register-society")} className="rounded-lg cursor-pointer">
                    <Building2 className="mr-2 h-4 w-4" />
                    Register Society
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate("/notifications")} className="rounded-lg cursor-pointer">
                  <Bell className="mr-2 h-4 w-4" />
                  Notification Preferences
                </DropdownMenuItem>
                {/* Mobile-only settings */}
                <div className="md:hidden">
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="rounded-lg">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">Theme & Language</span>
                      <div className="flex gap-1">
                        <ThemeToggle />
                        <LanguageSelector />
                      </div>
                    </div>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive rounded-lg cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="eco" size="sm" onClick={() => navigate("/auth")} className="h-8 md:h-9 text-xs md:text-sm px-3 md:px-4">
              <User className="mr-1 h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign In</span>
              <span className="sm:hidden">Login</span>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav - only when logged in */}
      {user && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-xl safe-area-bottom">
          <div className="flex items-center justify-around h-14 px-2">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all min-w-[60px]",
                  isActive(link.path)
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <link.icon className={cn("h-5 w-5", isActive(link.path) && "text-primary")} />
                <span className="text-[10px] font-medium">{link.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
