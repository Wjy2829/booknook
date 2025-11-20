import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '@/components/SearchBar';
import { BookCard } from '@/components/BookCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { useAuth } from '@/context/AuthContext';
import { fetchBookShares, toggleLike } from '@/services/bookShares';
import type { BookShare, SortOption } from '@/types';

const sortOptions: { key: SortOption; label: string }[] = [
  { key: 'newest', label: '最新发布' },
  { key: 'popular', label: '最多点赞' },
];

export const HomePage = () => {
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');
  const [shares, setShares] = useState<BookShare[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();
  const navigate = useNavigate();

  const debouncedSearch = useMemo(() => searchQuery.trim(), [searchQuery]);

  const loadShares = async () => {
    setIsLoading(true);
    try {
      const data = await fetchBookShares({
        search: debouncedSearch,
        sort,
        currentUserId: session?.user.id,
      });
      setShares(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchQuery(search);
  };

  useEffect(() => {
    loadShares();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, sort, session?.user.id]);

  const handleLike = async (share: BookShare) => {
    if (!session) {
      navigate('/auth');
      return;
    }
    await toggleLike({
      shareId: share.id,
      userId: session.user.id,
      hasLiked: share.user_has_liked ?? false,
    });
    setShares((prev) =>
      prev.map((item) =>
        item.id === share.id
          ? {
              ...item,
              user_has_liked: !share.user_has_liked,
              like_count: share.user_has_liked ? item.like_count - 1 : item.like_count + 1,
            }
          : item,
      ),
    );
  };

  return (
    <section className="page-container">
      <div className="hero">
        <h1>BookNook · 小书角</h1>
        <p>用最短的内容传递最有价值的读书体验</p>
        <SearchBar value={search} onChange={setSearch} onSearch={handleSearch} />
        <div className="sort-tabs">
          {sortOptions.map((option) => (
            <button
              type="button"
              key={option.key}
              className={sort === option.key ? 'active' : ''}
              onClick={() => setSort(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid">
        {isLoading &&
          Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index.toString()} />)}
        {!isLoading &&
          shares.map((share) => <BookCard key={share.id} share={share} onLike={handleLike} />)}
      </div>
      {!isLoading && !shares.length && <p className="empty-tip">暂无分享，成为第一个发布者吧！</p>}
    </section>
  );
};

