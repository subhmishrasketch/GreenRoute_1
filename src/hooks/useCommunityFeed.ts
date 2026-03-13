import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CommunityPost {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  postType: string;
  likesCount: number;
  createdAt: string;
  authorName?: string;
  isLiked?: boolean;
  comments: PostComment[];
}

export interface PostComment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  authorName?: string;
}

export function useCommunityFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    const { data: postsData } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!postsData) return;

    // Fetch user profiles for author names
    const userIds = [...new Set(postsData.map((p: any) => p.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", userIds);

    // Fetch likes for current user
    let userLikes: string[] = [];
    if (user) {
      const { data: likes } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", user.id);
      userLikes = (likes || []).map((l: any) => l.post_id);
    }

    // Fetch comments
    const postIds = postsData.map((p: any) => p.id);
    const { data: commentsData } = await supabase
      .from("post_comments")
      .select("*")
      .in("post_id", postIds)
      .order("created_at", { ascending: true });

    const commentUserIds = [...new Set((commentsData || []).map((c: any) => c.user_id))];
    const { data: commentProfiles } = commentUserIds.length > 0
      ? await supabase.from("profiles").select("user_id, full_name").in("user_id", commentUserIds)
      : { data: [] };

    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p.full_name]));
    const commentProfileMap = new Map((commentProfiles || []).map((p: any) => [p.user_id, p.full_name]));

    const mapped: CommunityPost[] = postsData.map((p: any) => ({
      id: p.id,
      userId: p.user_id,
      content: p.content,
      imageUrl: p.image_url,
      postType: p.post_type,
      likesCount: p.likes_count,
      createdAt: p.created_at,
      authorName: profileMap.get(p.user_id) || "Anonymous",
      isLiked: userLikes.includes(p.id),
      comments: (commentsData || [])
        .filter((c: any) => c.post_id === p.id)
        .map((c: any) => ({
          id: c.id,
          userId: c.user_id,
          content: c.content,
          createdAt: c.created_at,
          authorName: commentProfileMap.get(c.user_id) || "Anonymous",
        })),
    }));

    setPosts(mapped);
  }, [user]);

  const createPost = useCallback(async (content: string, postType: string, imageUrl?: string) => {
    if (!user) return;

    const { error } = await supabase.from("community_posts").insert({
      user_id: user.id,
      content,
      post_type: postType,
      image_url: imageUrl,
    });

    if (!error) {
      toast.success("Post shared! 🌿");
      fetchPosts();
    }
  }, [user, fetchPosts]);

  const toggleLike = useCallback(async (postId: string, isLiked: boolean) => {
    if (!user) return;

    if (isLiked) {
      await supabase.from("post_likes").delete().eq("user_id", user.id).eq("post_id", postId);
      await supabase.from("community_posts").update({ likes_count: Math.max(0, posts.find(p => p.id === postId)!.likesCount - 1) }).eq("id", postId);
    } else {
      await supabase.from("post_likes").insert({ user_id: user.id, post_id: postId });
      await supabase.from("community_posts").update({ likes_count: (posts.find(p => p.id === postId)?.likesCount || 0) + 1 }).eq("id", postId);
    }

    fetchPosts();
  }, [user, posts, fetchPosts]);

  const addComment = useCallback(async (postId: string, content: string) => {
    if (!user) return;

    const { error } = await supabase.from("post_comments").insert({
      user_id: user.id,
      post_id: postId,
      content,
    });

    if (!error) {
      fetchPosts();
    }
  }, [user, fetchPosts]);

  useEffect(() => {
    fetchPosts().finally(() => setLoading(false));

    // Realtime subscription
    const channel = supabase
      .channel("community-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts" }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchPosts]);

  return { posts, loading, createPost, toggleLike, addComment, refetch: fetchPosts };
}
