import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { fetchBookShare, deleteBookShare, toggleLike } from '@/services/bookShares';
import { fetchComments, createComment, deleteComment } from '@/services/comments';
import { useRealtimeLikes } from '@/hooks/useRealtimeLikes';
import { useRealtimeComments } from '@/hooks/useRealtimeComments';
import type { BookShare, Comment } from '@/types';
import { formatRelativeTime } from '@/utils/format';
import { LikeButton } from '@/components/LikeButton';
import { CommentList } from '@/components/CommentList';
import { CommentForm } from '@/components/CommentForm';

export const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [share, setShare] = useState<BookShare | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommenting, setIsCommenting] = useState(false);

  const loadShare = async () => {
    if (!id) return;
    const data = await fetchBookShare(id, session?.user.id);
    setShare(data);
    setIsLoading(false);
  };

  const loadComments = async () => {
    if (!id) return;
    const list = await fetchComments(id);
    setComments(list);
  };

  useEffect(() => {
    loadShare();
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, session?.user.id]);

  useRealtimeLikes({
    shareId: id,
    onChange: (count) =>
      setShare((prev) => (prev ? { ...prev, like_count: count } : prev)),
  });

  useRealtimeComments({
    shareId: id,
    onInsert: (comment) => {
      setComments((prev) => [...prev, comment]);
    },
    onDelete: (commentId) => {
      setComments((prev) => prev.filter((item) => item.id !== commentId));
    },
  });

  const handleLike = async () => {
    if (!share || !session) {
      navigate('/auth');
      return;
    }
    await toggleLike({
      shareId: share.id,
      userId: session.user.id,
      hasLiked: share.user_has_liked ?? false,
    });
    setShare((prev) =>
      prev
        ? {
            ...prev,
            user_has_liked: !prev.user_has_liked,
            like_count: prev.user_has_liked ? prev.like_count - 1 : prev.like_count + 1,
          }
        : prev,
    );
  };

  const handleComment = async (content: string) => {
    if (!session || !id) {
      navigate('/auth');
      return;
    }
    setIsCommenting(true);
    await createComment({ shareId: id, userId: session.user.id, content });
    setIsCommenting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
  };

  const handleDeleteShare = async () => {
    if (!share) return;
    const confirmed = window.confirm('确定删除这条分享吗？');
    if (!confirmed) return;
    await deleteBookShare(share.id);
    navigate('/');
  };

  if (isLoading || !share) {
    return <section className="page-container">加载中…</section>;
  }

  return (
    <section className="page-container detail-page">
      <div className="detail-header">
        <img
          src={
            share.cover_url ?? `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(share.title)}`
          }
          alt={share.title}
        />
        <div>
          <h1>{share.title}</h1>
          <p>作者：{share.author}</p>
          <div className="poster">
            <img
              src={
                share.profiles?.avatar_url ??
                `https://api.dicebear.com/7.x/initials/svg?seed=${share.profiles?.username ?? '读者'}`
              }
              alt={share.profiles?.username}
            />
            <div>
              <strong>{share.profiles?.username ?? '匿名读者'}</strong>
              <span>{formatRelativeTime(share.created_at)}</span>
            </div>
          </div>
          <LikeButton
            count={share.like_count}
            active={share.user_has_liked}
            onToggle={handleLike}
            disabled={!session}
          />
          {session?.user.id === share.user_id && (
            <div className="author-actions">
              <button type="button" onClick={() => navigate(`/share/${share.id}/edit`)}>
                编辑分享
              </button>
              <button type="button" className="danger" onClick={handleDeleteShare}>
                删除
              </button>
            </div>
          )}
        </div>
      </div>
      <article className="detail-body">
        <h2>推荐理由</h2>
        {share.review.split('\n').map((paragraph) => (
          <p key={paragraph.slice(0, 16)}>{paragraph}</p>
        ))}
      </article>
      <section className="detail-comments">
        <h2>评论</h2>
        <CommentList
          comments={comments}
          currentUserId={session?.user.id}
          onDelete={handleDeleteComment}
        />
        {session ? (
          <CommentForm disabled={isCommenting} onSubmit={handleComment} />
        ) : (
          <p className="empty-tip">
            登录后即可评论
            <button type="button" onClick={() => navigate('/auth')}>
              立即登录
            </button>
          </p>
        )}
      </section>
    </section>
  );
};

