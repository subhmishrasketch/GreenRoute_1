import { useState } from "react";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useComplaints } from "@/hooks/useComplaints";

const statusColors: Record<string, string> = {
  open: "bg-[hsl(var(--warning-amber))]/10 text-[hsl(var(--warning-amber))] border-[hsl(var(--warning-amber))]/30",
  in_progress: "bg-[hsl(var(--plastic-blue))]/10 text-[hsl(var(--plastic-blue))] border-[hsl(var(--plastic-blue))]/30",
  resolved: "bg-[hsl(var(--success-green))]/10 text-[hsl(var(--success-green))] border-[hsl(var(--success-green))]/30",
};

export function ComplaintForm() {
  const { complaints, loading, createComplaint } = useComplaints();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) return;
    setSubmitting(true);
    const success = await createComplaint(subject, description, category);
    if (success) {
      setSubject("");
      setDescription("");
      setCategory("general");
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Submit form */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Submit Feedback / Complaint
          </CardTitle>
          <CardDescription>
            Report an issue or share feedback about waste collection services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="missed_pickup">Missed Pickup</SelectItem>
              <SelectItem value="driver_issue">Driver Issue</SelectItem>
              <SelectItem value="scheduling">Scheduling</SelectItem>
              <SelectItem value="suggestion">Suggestion</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Describe your issue or feedback..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
          <Button
            variant="eco"
            onClick={handleSubmit}
            disabled={submitting || !subject.trim() || !description.trim()}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Submit
          </Button>
        </CardContent>
      </Card>

      {/* My complaints */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">My Complaints</h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : complaints.length === 0 ? (
          <Card variant="elevated" className="py-8 text-center">
            <p className="text-muted-foreground">No complaints submitted yet</p>
          </Card>
        ) : (
          complaints.map((c) => (
            <Card key={c.id} variant="elevated">
              <CardContent className="pt-4 pb-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-medium text-sm">{c.subject}</h4>
                    <p className="text-xs text-muted-foreground capitalize">{c.category.replace("_", " ")}</p>
                  </div>
                  <Badge variant="outline" className={`text-xs capitalize ${statusColors[c.status] || ""}`}>
                    {c.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{c.description}</p>
                {c.admin_response && (
                  <div className="mt-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-xs font-medium text-primary mb-1">Admin Response:</p>
                    <p className="text-sm text-foreground">{c.admin_response}</p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
