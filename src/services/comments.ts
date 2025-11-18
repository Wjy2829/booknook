import { supabase } from '@/lib/supabaseClient';
import type { Comment } from '@/types';

export const fetchComments = async (shareId: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select('*, profiles(*)')
    .eq('book_share_id', shareId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Comment[];
};

export const createComment = async ({
  shareId,
  userId,
  content,
}: {
  shareId: string;
  userId: string;
  content: string;
}) => {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      book_share_id: shareId,
      user_id: userId,
      content,
    })
    .select('*, profiles(*)')
    .single();
  if (error) throw error;
  return data as Comment;
};

export const deleteComment = async (commentId: string) => {
  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  if (error) throw error;
};

