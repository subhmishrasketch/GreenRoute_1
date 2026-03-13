import { useState } from "react";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useComplaints } from "@/hooks/useComplaints";

const statusColors: Record<string, string> = {
  open: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30",
  in_progress: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  resolved: "bg-green-500/10 text-green-700 border-green-500/30",
};

export function ComplaintManagement() {
  const { complaints, loading, respondToComplaint } = useComplaints();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);

  const handleRespond = async (id: string) => {
    const text = responses[id]?.trim();
    if (!text) return;
    setSending(id);
    const success = await respondToComplaint(id, text);
    if (success) setResponses((prev) => ({ ...prev, [id]: "" }));
    setSending(null);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        Complaints & Feedback ({complaints.filter((c) => c.status === "open").length} open)
      </h2>

      {complaints.length === 0 ? (
        <Card variant="elevated" className="py-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No complaints received</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <Card key={c.id} variant="elevated">
              <CardContent className="pt-4 pb-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-medium text-sm">{c.subject}</h4>
                    <p className="text-xs text-muted-foreground capitalize">{c.category.replace("_", " ")} • {new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="outline" className={`text-xs capitalize ${statusColors[c.status] || ""}`}>
                    {c.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{c.description}</p>

                {c.admin_response ? (
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-xs font-medium text-primary mb-1">Your Response:</p>
                    <p className="text-sm">{c.admin_response}</p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your response..."
                      value={responses[c.id] || ""}
                      onChange={(e) => setResponses((prev) => ({ ...prev, [c.id]: e.target.value }))}
                      rows={2}
                      className="flex-1"
                    />
                    <Button
                      variant="eco"
                      size="icon"
                      className="shrink-0 self-end"
                      disabled={!responses[c.id]?.trim() || sending === c.id}
                      onClick={() => handleRespond(c.id)}
                    >
                      {sending === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
