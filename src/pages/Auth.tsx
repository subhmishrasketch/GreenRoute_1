import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Recycle, 
  Mail, 
  Lock, 
  User, 
  AlertCircle, 
  Loader2, 
  Leaf, 
  TrendingUp, 
  Award,
  Shield,
  ArrowRight,
  Sparkles,
  Truck
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Footer } from "@/components/Footer";
import { GalleryShowcase } from "@/components/GalleryShowcase";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const nameSchema = z.string().min(2, "Name must be at least 2 characters");

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, user, role } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("login");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");

  // Redirect if already logged in, block drivers from society login
  useEffect(() => {
    if (user) {
      if (role === "driver") {
        navigate("/driver");
      } else {
        navigate("/");
      }
    }
  }, [user, role, navigate]);

  if (user) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(error.message);
      }
    } else {
      // Role check will happen in useEffect after auth state updates
      toast.success("Welcome back!");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      nameSchema.parse(signupName);
      emailSchema.parse(signupEmail);
      passwordSchema.parse(signupPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    setIsLoading(false);

    if (error) {
      if (error.message.includes("User already registered")) {
        setError("An account with this email already exists. Please sign in.");
      } else {
        setError(error.message);
      }
    } else {
      toast.success("Account created successfully!", {
        description: "You are now logged in.",
      });
      navigate("/");
    }
  };

  const features = [
    {
      icon: <Recycle className="h-5 w-5" />,
      title: "Smart Recycling",
      description: "Schedule pickups for packaging waste effortlessly",
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Real-time Tracking",
      description: "Track your pickup status and vehicle location live",
    },
    {
      icon: <Award className="h-5 w-5" />,
      title: "Earn Eco-Points",
      description: "Get rewarded for every package you recycle",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Side - Hero Section (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
          {/* Background with gradient */}
          <div className="absolute inset-0 gradient-eco" />
          
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-20 h-80 w-80 rounded-full bg-white/8 blur-[100px] animate-pulse-soft" />
            <div className="absolute bottom-32 right-16 h-96 w-96 rounded-full bg-white/5 blur-[120px] animate-float" />
            <div className="absolute top-1/3 left-1/3 h-56 w-56 rounded-full bg-white/6 blur-[80px]" />
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-grid)" />
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Recycle className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Green<span className="text-white/80">Route</span>
                </h1>
                <p className="text-white/70 text-sm">Smart Waste Management</p>
              </div>
            </div>

            {/* Hero Text */}
            <div className="max-w-lg">
              <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
                Making Mira-Bhayandar 
                <span className="block mt-2">
                  <span className="inline-flex items-center gap-2">
                    Greener <Leaf className="h-10 w-10 inline animate-float" />
                  </span>
                </span>
              </h2>
              <p className="text-lg text-white/80 mb-10 leading-relaxed">
                Join thousands of societies in our mission to reduce packaging waste. 
                Schedule pickups, track in real-time, and earn rewards for recycling.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 transition-all duration-300 hover:bg-white/[0.18] hover:translate-x-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-white shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
                    <p className="text-xs text-white/65">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12 pt-8 border-t border-white/20">
              <div>
                <p className="text-3xl font-bold text-white">500+</p>
                <p className="text-sm text-white/70">Societies Joined</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">25K kg</p>
                <p className="text-sm text-white/70">Waste Recycled</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">12K kg</p>
                <p className="text-sm text-white/70">CO₂ Reduced</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-background via-background to-accent/20">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="text-center mb-8 lg:hidden">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl gradient-eco shadow-elevated mb-4">
                <Recycle className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Green<span className="text-primary">Route</span>
              </h1>
              <p className="text-sm text-muted-foreground">Smart Waste Management</p>
            </div>

            <Card variant="elevated" className="animate-slide-up border-border/30 shadow-elevated overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-primary via-[hsl(165,55%,40%)] to-[hsl(172,60%,42%)]" />
              <CardHeader className="text-center pb-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary">Welcome to GreenRoute</span>
                </div>
                <CardTitle className="text-2xl">
                  {activeTab === "login" ? "Welcome Back!" : "Join the Movement"}
                </CardTitle>
                <CardDescription>
                  {activeTab === "login"
                    ? "Sign in to manage your pickups"
                    : "Create an account to start recycling"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
                    <TabsTrigger value="login" className="text-sm font-medium">
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="text-sm font-medium">
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                  {error && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Login Tab */}
                  <TabsContent value="login" className="space-y-0">
                    <form onSubmit={handleLogin} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-sm font-medium">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="you@example.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="pl-11 h-12 rounded-xl"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-sm font-medium">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="pl-11 h-12 rounded-xl"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        variant="eco"
                        size="lg"
                        className="w-full h-12 rounded-xl text-base font-semibold gap-2"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Signup Tab */}
                  <TabsContent value="signup" className="space-y-0">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-sm font-medium">
                          Full Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="John Doe"
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            className="pl-11 h-12 rounded-xl"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-sm font-medium">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@example.com"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            className="pl-11 h-12 rounded-xl"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-sm font-medium">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="••••••••"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            className="pl-11 h-12 rounded-xl"
                            required
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          At least 6 characters
                        </p>
                      </div>

                      {/* Role Hint */}
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                        <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-muted-foreground">
                          <p className="font-medium text-foreground">Account Types</p>
                          <p className="mt-0.5">
                            Include "admin" in email for MBMC admin access. 
                            All other emails get caretaker access.
                          </p>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        variant="eco"
                        size="lg"
                        className="w-full h-12 rounded-xl text-base font-semibold gap-2"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            Create Account
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                {/* Driver Login Link */}
                <div className="mt-4 text-center">
                  <Button variant="link" className="text-sm text-muted-foreground gap-2" onClick={() => navigate("/driver-login")}>
                    <Truck className="h-4 w-4" /> Driver? Sign in here
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground">
                      Powered by MBMC
                    </span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Secure</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Private</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-1">
                    <Leaf className="h-3.5 w-3.5" />
                    <span>Eco-friendly</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              By signing in, you agree to help make Mira-Bhayandar greener 🌿
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Showcase */}
      <GalleryShowcase />

      {/* Footer */}
      <Footer />
    </div>
  );
}
