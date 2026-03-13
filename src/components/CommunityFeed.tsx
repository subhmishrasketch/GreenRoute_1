import { useState } from "react";
import { Heart, MessageCircle, Send, Leaf, Camera, Lightbulb, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useCommunityFeed, type CommunityPost } from "@/hooks/useCommunityFeed";

const postTypeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  tip: { label: "Eco Tip", icon: Lightbulb, color: "bg-[hsl(var(--warning-amber))]/10 text-[hsl(var(--warning-amber))] border-[hsl(var(--warning-amber))]/30" },
  cleanup: { label: "Cleanup", icon: Camera, color: "bg-[hsl(var(--success-green))]/10 text-[hsl(var(--success-green))] border-[hsl(var(--success-green))]/30" },
  achievement: { label: "Achievement", icon: Leaf, color: "bg-primary/10 text-primary border-primary/30" },
  general: { label: "General", icon: MessageCircle, color: "bg-muted text-muted-foreground border-border" },
};

export function CommunityFeed() {
  const { posts, loading, createPost, toggleLike, addComment } = useCommunityFeed();
  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState("tip");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const handleSubmit = async () => {
    if (!newPost.trim()) return;
    await createPost(newPost.trim(), postType);
    setNewPost("");
  };

  const handleComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;
    await addComment(postId, content);
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  return (
    <div className="space-y-4">
      {/* Create Post */}
      <Card variant="elevated">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            Community Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Share an eco-tip, cleanup story, or achievement..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="mb-3 resize-none"
            rows={3}
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(postTypeConfig).map(([key, config]) => (
                <Button
                  key={key}
                  variant={postType === key ? "default" : "outline"}
                  size="sm"
                  className="text-[11px] md:text-xs h-7"
                  onClick={() => setPostType(key)}
                >
                  <config.icon className="h-3 w-3 mr-1" />
                  {config.label}
                </Button>
              ))}
            </div>
            <Button size="sm" variant="eco" onClick={handleSubmit} disabled={!newPost.trim()} className="w-full sm:w-auto">
              <Send className="h-3.5 w-3.5 mr-1" /> Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading feed...</div>
      ) : posts.length === 0 ? (
        <Card variant="glass" className="text-center py-8">
          <CardContent>
            <Leaf className="h-12 w-12 text-primary/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
          </CardContent>
        </Card>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} onLike={toggleLike} onComment={handleComment} commentInput={commentInputs[post.id] || ""} onCommentChange={(val) => setCommentInputs((prev) => ({ ...prev, [post.id]: val }))} expanded={expandedComments.has(post.id)} onToggleComments={() => setExpandedComments((prev) => {
          const next = new Set(prev);
          next.has(post.id) ? next.delete(post.id) : next.add(post.id);
          return next;
        })} />)
      )}
    </div>
  );
}

function PostCard({
  post, onLike, onComment, commentInput, onCommentChange, expanded, onToggleComments,
}: {
  post: CommunityPost;
  onLike: (id: string, isLiked: boolean) => void;
  onComment: (id: string) => void;
  commentInput: string;
  onCommentChange: (val: string) => void;
  expanded: boolean;
  onToggleComments: () => void;
}) {
  const config = postTypeConfig[post.postType] || postTypeConfig.general;
  const initials = (post.authorName || "A").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Card variant="default" className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">{post.authorName}</span>
              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", config.color)}>
                <config.icon className="h-2.5 w-2.5 mr-0.5" />
                {config.label}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {new Date(post.createdAt).toLocaleDateString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        <p className="text-sm text-foreground mb-3 whitespace-pre-wrap">{post.content}</p>

        {post.imageUrl && (
          <div className="rounded-xl overflow-hidden mb-3 border border-border">
            <img src={post.imageUrl} alt="" className="w-full max-h-64 object-cover" />
          </div>
        )}

        <div className="flex items-center gap-4 pt-2 border-t border-border/50">
          <button
            onClick={() => onLike(post.id, !!post.isLiked)}
            className={cn("flex items-center gap-1.5 text-xs transition-colors", post.isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500")}
          >
            <Heart className={cn("h-4 w-4", post.isLiked && "fill-current")} />
            {post.likesCount}
          </button>
          <button onClick={onToggleComments} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
            <MessageCircle className="h-4 w-4" />
            {post.comments.length}
          </button>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-2 bg-accent/50 rounded-lg p-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[9px] bg-muted">{(comment.authorName || "A")[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-xs font-medium text-foreground">{comment.authorName}</span>
                  <p className="text-xs text-muted-foreground">{comment.content}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentInput}
                onChange={(e) => onCommentChange(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                onKeyDown={(e) => e.key === "Enter" && onComment(post.id)}
              />
              <Button size="sm" variant="ghost" className="h-7" onClick={() => onComment(post.id)}>
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
