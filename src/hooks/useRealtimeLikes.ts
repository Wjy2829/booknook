import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Options = {
  shareId?: string;
  onChange: (likeCount: number) => void;
};

export const useRealtimeLikes = ({ shareId, onChange }: Options) => {
  useEffect(() => {
    if (!shareId) return undefined;
    const channel = supabase
      .channel(`book_shares_like_${shareId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'book_shares',
          filter: `id=eq.${shareId}`,
        },
        (payload) => {
          const likeCount = payload.new.like_count as number;
          onChange(likeCount);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onChange, shareId]);
};

