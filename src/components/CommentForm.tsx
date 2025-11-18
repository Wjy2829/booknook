import { FormEvent, useState } from 'react';

type Props = {
  disabled?: boolean;
  onSubmit: (content: string) => Promise<void> | void;
};

export const CommentForm = ({ disabled, onSubmit }: Props) => {
  const [content, setContent] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!content.trim()) return;
    await onSubmit(content.trim());
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <textarea
        value={content}
        maxLength={140}
        placeholder="写下你的一句话短评（140 字内）"
        onChange={(event) => setContent(event.target.value)}
        disabled={disabled}
      />
      <div className="comment-form__actions">
        <span>{content.length} / 140</span>
        <button type="submit" disabled={disabled || !content.trim()}>
          发送
        </button>
      </div>
    </form>
  );
};

