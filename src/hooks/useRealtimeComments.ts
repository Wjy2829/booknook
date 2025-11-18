import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Comment } from '@/types';

type Options = {
  shareId?: string;
  onInsert: (comment: Comment) => void;
  onDelete?: (commentId: string) => void;
};

export const useRealtimeComments = ({ shareId, onInsert, onDelete }: Options) => {
  useEffect(() => {
    if (!shareId) return undefined;
    const channel = supabase
      .channel(`comments_${shareId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `book_share_id=eq.${shareId}`,
        },
        (payload) => {
          onInsert(payload.new as Comment);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          filter: `book_share_id=eq.${shareId}`,
        },
        (payload) => {
          onDelete?.(payload.old.id as string);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onDelete, onInsert, shareId]);
};

