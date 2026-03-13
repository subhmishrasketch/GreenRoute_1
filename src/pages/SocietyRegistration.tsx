import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Home, Users, ArrowLeft, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const societySchema = z.object({
  name: z.string().min(3, "Society name must be at least 3 characters"),
  area: z.string().min(2, "Area must be at least 2 characters"),
  numberOfFlats: z.number().min(1, "Must have at least 1 flat").max(5000, "Maximum 5000 flats"),
  address: z.string().optional(),
});

export default function SocietyRegistration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [numberOfFlats, setNumberOfFlats] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError("You must be logged in to register a society");
      return;
    }

    // Check if user already has a society
    const { data: existing } = await supabase
      .from("societies")
      .select("id, name")
      .eq("caretaker_id", user.id)
      .limit(1);

    if (existing && existing.length > 0) {
      setError(`You already have a registered society: "${existing[0].name}". Each caretaker can only register one society.`);
      return;
    }

    try {
      const validatedData = societySchema.parse({
        name,
        area,
        numberOfFlats: parseInt(numberOfFlats) || 0,
        address: address || undefined,
      });

      setIsLoading(true);

      // Create society
      const { data: society, error: societyError } = await supabase
        .from("societies")
        .insert({
          name: validatedData.name,
          area: validatedData.area,
          number_of_flats: validatedData.numberOfFlats,
          address: validatedData.address,
          caretaker_id: user.id,
        })
        .select()
        .single();

      if (societyError) throw societyError;

      // Update profile with society reference
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          registered_society_id: society.id,
          society_name: validatedData.name,
          area: validatedData.area,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      setSuccess(true);
      toast.success("Society registered successfully!", {
        description: `${validatedData.name} is now part of GreenRoute!`,
      });

      // Force a full page reload to ensure fresh data
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
        <Card variant="elevated" className="w-full max-w-md text-center animate-scale-in">
          <CardContent className="pt-12 pb-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to GreenRoute!</h2>
            <p className="text-muted-foreground mb-4">
              Your society <span className="font-semibold text-foreground">{name}</span> has been registered successfully.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              <span>Redirecting to dashboard...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <Card variant="elevated" className="animate-slide-up">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-eco shadow-elevated">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Register Your Society</CardTitle>
            <CardDescription>
              Join GreenRoute and start managing your society's packaging waste efficiently
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
              )}

              <div className="space-y-2">
                <Label htmlFor="society-name">Society Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="society-name" placeholder="e.g., Green Valley CHS" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Area / Locality</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="area" placeholder="e.g., Mira Road East" value={area} onChange={(e) => setArea(e.target.value)} className="pl-10" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="flats">Number of Flats</Label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="flats" type="number" placeholder="e.g., 120" value={numberOfFlats} onChange={(e) => setNumberOfFlats(e.target.value)} className="pl-10" min="1" max="5000" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address (Optional)</Label>
                <Textarea id="address" placeholder="Complete address of your society..." value={address} onChange={(e) => setAddress(e.target.value)} rows={3} />
              </div>

              <Button type="submit" variant="eco" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Users className="h-4 w-4" /> Register Society
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          By registering, your society joins the GreenRoute initiative for sustainable waste management 🌱
        </p>
      </div>
    </div>
  );
}
