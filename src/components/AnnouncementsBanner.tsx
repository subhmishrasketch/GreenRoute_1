import { useEffect, useState } from "react";
import { Megaphone, X, AlertTriangle } from "lucide-react";
import { useAnnouncements } from "@/hooks/useAnnouncements";

export function AnnouncementsBanner() {
  const { announcements, loading } = useAnnouncements();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const active = announcements.filter(
    (a) => a.is_active && !dismissed.has(a.id) && (!a.expires_at || new Date(a.expires_at) > new Date())
  );

  if (loading || active.length === 0) return null;

  const priorityStyles: Record<string, string> = {
    urgent: "bg-destructive/10 border-destructive/30 text-destructive",
    important: "bg-yellow-500/10 border-yellow-500/30 text-yellow-700",
    normal: "bg-primary/5 border-primary/20 text-primary",
  };

  return (
    <div className="space-y-2 mb-6">
      {active.slice(0, 3).map((a) => (
        <div
          key={a.id}
          className={`flex items-start gap-3 p-3 rounded-xl border ${priorityStyles[a.priority] || priorityStyles.normal}`}
        >
          {a.priority === "urgent" ? (
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          ) : (
            <Megaphone className="h-4 w-4 mt-0.5 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{a.title}</p>
            <p className="text-xs opacity-80 mt-0.5 line-clamp-2">{a.content}</p>
          </div>
          <button
            onClick={() => setDismissed((prev) => new Set(prev).add(a.id))}
            className="shrink-0 opacity-60 hover:opacity-100 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
