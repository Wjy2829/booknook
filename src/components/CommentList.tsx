import type { Comment } from '@/types';
import { formatRelativeTime } from '@/utils/format';

type Props = {
  comments: Comment[];
  currentUserId?: string;
  onDelete?: (commentId: string) => void;
};

export const CommentList = ({ comments, currentUserId, onDelete }: Props) => {
  if (!comments.length) {
    return <p className="empty-tip">还没有评论，来发表第一条短评吧～</p>;
    }

  return (
    <ul className="comment-list">
      {comments.map((comment) => (
        <li key={comment.id}>
          <div className="comment-author">
            <img
              src={
                comment.profiles?.avatar_url ??
                `https://api.dicebear.com/7.x/initials/svg?seed=${comment.profiles?.username ?? '读者'}`
              }
              alt={comment.profiles?.username}
            />
            <div>
              <strong>{comment.profiles?.username ?? '读者'}</strong>
              <span>{formatRelativeTime(comment.created_at)}</span>
            </div>
            {currentUserId === comment.user_id && (
              <button type="button" onClick={() => onDelete?.(comment.id)}>
                删除
              </button>
            )}
          </div>
          <p>{comment.content}</p>
        </li>
      ))}
    </ul>
  );
};

