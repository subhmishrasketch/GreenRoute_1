import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Recycle, Leaf } from "lucide-react";

export default function Splash() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"enter" | "visible" | "exit">("enter");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("visible"), 100);
    const t2 = setTimeout(() => setPhase("exit"), 2500);
    const t3 = setTimeout(() => navigate("/auth", { replace: true }), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center gradient-eco relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-20 left-20 h-80 w-80 rounded-full bg-white/8 blur-[100px] animate-pulse-soft" />
      <div className="absolute bottom-32 right-16 h-96 w-96 rounded-full bg-white/5 blur-[120px] animate-float" />

      <div
        className={`flex flex-col items-center gap-6 transition-all duration-700 ease-out ${
          phase === "enter"
            ? "opacity-0 scale-75 translate-y-8"
            : phase === "visible"
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-110 -translate-y-8"
        }`}
      >
        {/* Animated logo */}
        <div className="relative">
          <div
            className={`flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm transition-all duration-1000 ${
              phase === "visible" ? "rotate-0" : "rotate-180"
            }`}
          >
            <Recycle className="h-12 w-12 text-white" />
          </div>
          {/* Orbiting leaf */}
          <div
            className={`absolute -top-2 -right-2 transition-all duration-1000 ${
              phase === "visible" ? "opacity-100 scale-100" : "opacity-0 scale-0"
            }`}
          >
            <Leaf className="h-8 w-8 text-white/80 animate-float" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <h1
            className={`text-4xl sm:text-5xl font-bold text-white transition-all duration-700 delay-200 ${
              phase === "visible" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Welcome to
          </h1>
          <h2
            className={`text-5xl sm:text-6xl font-bold text-white mt-2 transition-all duration-700 delay-400 ${
              phase === "visible" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Green<span className="text-white/80">Route</span>
          </h2>
        </div>

        {/* Tagline */}
        <p
          className={`text-lg text-white/70 transition-all duration-700 delay-500 ${
            phase === "visible" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Smart Waste Management 🌿
        </p>

        {/* Loading dots */}
        <div className="flex gap-2 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2.5 w-2.5 rounded-full bg-white/60"
              style={{
                animation: phase === "visible" ? `pulse 1.2s ease-in-out ${i * 0.2}s infinite` : "none",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
