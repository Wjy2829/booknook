import { Link } from 'react-router-dom';
import clsx from 'classnames';
import type { BookShare } from '@/types';
import { limitText, formatRelativeTime } from '@/utils/format';

type Props = {
  share: BookShare;
  onLike?: (share: BookShare) => void;
};

export const BookCard = ({ share, onLike }: Props) => {
  const cover =
    share.cover_url ?? `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(share.title)}`;

  return (
    <article className="book-card">
      <Link to={`/books/${share.id}`} className="card-link">
        <div className="cover">
          <img src={cover} alt={share.title} loading="lazy" />
        </div>
        <div className="card-body">
          <div className="card-header">
            <div>
              <h3>{share.title}</h3>
              <p className="author">{share.author}</p>
            </div>
            <p className="time">{formatRelativeTime(share.created_at)}</p>
          </div>
          <p className="review">{limitText(share.review, 140)}</p>
          <div className="card-footer">
            <div className="user">
              <img
                src={
                  share.profiles?.avatar_url ??
                  `https://api.dicebear.com/7.x/initials/svg?seed=${share.profiles?.username ?? 'NN'}`
                }
                alt={share.profiles?.username}
              />
              <span>{share.profiles?.username ?? '匿名读者'}</span>
            </div>
            <button
              type="button"
              className={clsx('like-chip', { active: share.user_has_liked })}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onLike?.(share);
              }}
            >
              ❤️ {share.like_count}
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
};

