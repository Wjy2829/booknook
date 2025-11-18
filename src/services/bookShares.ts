import { supabase } from '@/lib/supabaseClient';
import type { BookShare, SortOption } from '@/types';

type SharePayload = Pick<BookShare, 'title' | 'author' | 'cover_url' | 'review'>;

export const fetchBookShares = async ({
  search,
  sort = 'newest',
  currentUserId,
}: {
  search?: string;
  sort?: SortOption;
  currentUserId?: string;
}) => {
  let query = supabase
    .from('book_shares')
    .select('*, profiles(*), book_likes(user_id)')
    .order(sort === 'popular' ? 'like_count' : 'created_at', {
      ascending: false,
    });

  if (search) {
    const keyword = `%${search.trim()}%`;
    query = query.or(`title.ilike.${keyword},author.ilike.${keyword},review.ilike.${keyword}`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data.map((share) => ({
      ...share,
      user_has_liked: share.book_likes?.some((like: { user_id: string }) => like.user_id === currentUserId) ?? false,
    })) as BookShare[];
};

export const fetchBookShare = async (id: string, currentUserId?: string) => {
  const { data, error } = await supabase
    .from('book_shares')
    .select('*, profiles(*), book_likes(user_id)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return {
      ...data,
      user_has_liked: data.book_likes?.some((like: { user_id: string }) => like.user_id === currentUserId) ?? false,
    } as BookShare;
};

export const createBookShare = async (payload: SharePayload & { user_id: string }) => {
  const { data, error } = await supabase.from('book_shares').insert(payload).select('*').single();
  if (error) throw error;
  return data as BookShare;
};

export const updateBookShare = async (id: string, payload: SharePayload) => {
  const { data, error } = await supabase
    .from('book_shares')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as BookShare;
};

export const deleteBookShare = async (id: string) => {
  const { error } = await supabase.from('book_shares').delete().eq('id', id);
  if (error) throw error;
};

export const toggleLike = async ({
  shareId,
  userId,
  hasLiked,
}: {
  shareId: string;
  userId: string;
  hasLiked: boolean;
}) => {
  if (hasLiked) {
    const { error } = await supabase.from('book_likes').delete().eq('book_share_id', shareId).eq('user_id', userId);
    if (error) throw error;
    await supabase.rpc('decrement_like_count', { share_id: shareId });
  } else {
    const { error } = await supabase.from('book_likes').insert({ book_share_id: shareId, user_id: userId });
    if (error) throw error;
    await supabase.rpc('increment_like_count', { share_id: shareId });
  }
};

export const fetchUserShares = async (userId: string) => {
  const { data, error } = await supabase
    .from('book_shares')
    .select('*, profiles(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as BookShare[];
};

export const fetchUserLikedShares = async (userId: string) => {
  const { data, error } = await supabase
    .from('book_likes')
    .select('book_share_id, book_shares(*, profiles(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.flatMap((item: any) => Array.isArray(item.book_shares) ? item.book_shares : [item.book_shares]) as BookShare[];
};

