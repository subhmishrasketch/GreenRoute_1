import { 
  Recycle, 
  Mail, 
  Phone, 
  MapPin, 
  Github, 
  Linkedin, 
  Heart, 
  ExternalLink,
  Truck,
  Leaf,
  Award,
  Users,
  Shield,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const features = [
    { icon: Truck, label: "Smart Collection", desc: "GPS-tracked vehicles" },
    { icon: Recycle, label: "Eco Rewards", desc: "Earn points for recycling" },
    { icon: Clock, label: "Real-time Tracking", desc: "Live status updates" },
    { icon: Shield, label: "Secure Platform", desc: "Data protection" },
  ];

  const stats = [
    { value: "500+", label: "Societies" },
    { value: "10K+", label: "Pickups" },
    { value: "50T", label: "Waste Recycled" },
    { value: "25T", label: "CO₂ Saved" },
  ];

  return (
    <footer className="bg-gradient-to-b from-background via-muted/30 to-muted/50 border-t relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-success/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Stats Banner */}
      <div className="border-b bg-gradient-to-r from-primary/5 via-transparent to-success/5">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Row */}
      <div className="container py-8 border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 p-3 rounded-xl bg-card/50 hover:bg-card transition-colors group"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{feature.label}</p>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container py-12 relative z-10">
        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-eco shadow-lg animate-float">
                <Recycle className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-xl">
                  Green<span className="text-primary">Route</span>
                </h3>
                <p className="text-xs text-muted-foreground">Smart Waste Management</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Making Mira-Bhayandar greener, one package at a time. Join us in our mission to create a sustainable future through smart waste management and community engagement.
            </p>
            <div className="flex gap-2">
              <a
                href="https://www.linkedin.com/in/subh-kumar-mishra-76a635374/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl hover:bg-primary/10 transition-all"
              >
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:scale-110 transition-transform">
                  <Linkedin className="h-5 w-5" />
                </Button>
              </a>
              <a
                href="https://github.com/subhmishrasketch/GreenRoute_1"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl hover:bg-primary/10 transition-all"
              >
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:scale-110 transition-transform">
                  <Github className="h-5 w-5" />
                </Button>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Schedule Pickup", href: "/" },
                { label: "Rewards & Challenges", href: "/rewards" },
                { label: "Community Feed", href: "/community" },
                { label: "Eco Education Hub", href: "/education" },
                { label: "Register Your Society", href: "/register-society" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <CheckCircle2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Leaf className="h-4 w-4 text-success" />
              Resources
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Recycling Guidelines", href: "#" },
                { label: "Waste Categories", href: "#" },
                { label: "Environmental Impact Report", href: "#" },
                { label: "FAQ & Help Center", href: "#" },
                { label: "API Documentation", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <CheckCircle2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 group">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">
                  MBMC Office, Civic Center,<br />
                  Mira Road (E), Thane - 401107
                </span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <a href="tel:+912228555555" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  +91 22 2855 5555
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <a href="mailto:greenroute@mbmc.gov.in" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  greenroute@mbmc.gov.in
                </a>
              </li>
            </ul>

            <div className="pt-2">
              <a
                href="https://mbmc.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-sm text-primary font-medium hover:bg-primary/20 transition-colors"
              >
                Visit MBMC Website
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            <span>© {currentYear} GreenRoute. All rights reserved.</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Cookie Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Accessibility
            </a>
          </div>
        </div>

        {/* Environmental Badges */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 text-sm hover:bg-primary/10 transition-colors">
            <Recycle className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              UN SDG 12: <span className="text-primary font-medium">Responsible Consumption</span>
            </span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/5 border border-success/20 text-sm hover:bg-success/10 transition-colors">
            <Leaf className="h-4 w-4 text-success" />
            <span className="text-muted-foreground">
              <span className="text-success font-medium">Carbon Neutral</span> Operations
            </span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/5 border border-warning/20 text-sm hover:bg-warning/10 transition-colors">
            <Award className="h-4 w-4 text-warning" />
            <span className="text-muted-foreground">
              <span className="text-warning font-medium">ISO 14001</span> Certified
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
