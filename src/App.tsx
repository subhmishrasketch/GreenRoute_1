import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import DriverAuth from "./pages/DriverAuth";
import SocietyRegistration from "./pages/SocietyRegistration";
import DriverApp from "./pages/DriverApp";
import NotificationPreferences from "./pages/NotificationPreferences";
import Rewards from "./pages/Rewards";
import Community from "./pages/Community";
import Education from "./pages/Education";
import Splash from "./pages/Splash";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/welcome" element={<Splash />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/driver-login" element={<DriverAuth />} />
            <Route path="/register-society" element={<SocietyRegistration />} />
            <Route path="/driver" element={<DriverApp />} />
            <Route path="/notifications" element={<NotificationPreferences />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/community" element={<Community />} />
            <Route path="/education" element={<Education />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
