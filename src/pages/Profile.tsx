import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ProfileCard } from '@/components/ProfileCard';
import { BookCard } from '@/components/BookCard';
import {
  fetchUserLikedShares,
  fetchUserShares,
  deleteBookShare,
  toggleLike,
} from '@/services/bookShares';
import { uploadAvatar } from '@/services/storage';
import type { BookShare } from '@/types';
import { supabase } from '@/lib/supabaseClient';

export const ProfilePage = () => {
  const { profile, session, refreshProfile } = useAuth();
  const [myShares, setMyShares] = useState<BookShare[]>([]);
  const [likedShares, setLikedShares] = useState<BookShare[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userId = session?.user.id;

  const loadData = async () => {
    if (!userId) return;
    setLoading(true);
    const [shares, likes] = await Promise.all([fetchUserShares(userId), fetchUserLikedShares(userId)]);
    setMyShares(shares);
    setLikedShares(likes);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (!profile || !userId) {
    return <section className="page-container">正在加载…</section>;
  }

  const handleUpdateProfile = async (payload: Partial<typeof profile>) => {
    await supabase.from('profiles').update(payload).eq('id', userId);
    await refreshProfile();
  };

  const handleDeleteShare = async (shareId: string) => {
    const confirmed = window.confirm('确认删除这条分享吗？');
    if (!confirmed) return;
    await deleteBookShare(shareId);
    loadData();
  };

  const handleUnlike = async (share: BookShare) => {
    await toggleLike({
      shareId: share.id,
      userId,
      hasLiked: true,
    });
    loadData();
  };

  return (
    <section className="page-container profile-page">
      <ProfileCard profile={profile} onUpdate={handleUpdateProfile} onUploadAvatar={uploadAvatar} />
      <div className="profile-section">
        <div className="section-header">
          <h2>我的分享</h2>
          <button type="button" onClick={() => navigate('/share/new')}>
            发布新书
          </button>
        </div>
        {loading && <p>加载中…</p>}
        {!loading && !myShares.length && <p className="empty-tip">还没有分享，快去发布吧！</p>}
        <div className="grid">
          {myShares.map((share) => (
            <div key={share.id} className="profile-share-card">
              <BookCard share={share} />
              <div className="profile-share-actions">
                <button type="button" onClick={() => navigate(`/share/${share.id}/edit`)}>
                  编辑
                </button>
                <button type="button" className="danger" onClick={() => handleDeleteShare(share.id)}>
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="profile-section">
        <h2>我的互动 · 点赞过的分享</h2>
        {loading && <p>加载中…</p>}
        {!loading && !likedShares.length && <p className="empty-tip">还没有点赞记录</p>}
        <div className="grid">
          {likedShares.map((share) => (
            <div key={share.id} className="profile-share-card">
              <BookCard share={{ ...share, user_has_liked: true }} />
              <button type="button" className="unlike-button" onClick={() => handleUnlike(share)}>
                取消点赞
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

