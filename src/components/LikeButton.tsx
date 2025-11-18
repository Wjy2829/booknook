import clsx from 'classnames';

type Props = {
  active?: boolean;
  count: number;
  disabled?: boolean;
  onToggle: () => void;
};

export const LikeButton = ({ active, count, disabled, onToggle }: Props) => (
  <button
    type="button"
    className={clsx('like-button', { active })}
    disabled={disabled}
    onClick={onToggle}
  >
    <span>{active ? '已点赞' : '点赞'}</span>
    <strong>{count}</strong>
  </button>
);

