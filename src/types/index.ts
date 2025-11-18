export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
};

export type BookShare = {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  review: string;
  user_id: string;
  created_at: string;
  like_count: number;
  user_has_liked?: boolean;
  profiles?: Profile;
};

export type Comment = {
  id: string;
  book_share_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
};

export type BookLike = {
  id: string;
  book_share_id: string;
  user_id: string;
  created_at: string;
};

export type SortOption = 'newest' | 'popular';

