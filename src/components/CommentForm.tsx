import { FormEvent, useState } from 'react';

type Props = {
  disabled?: boolean;
  onSubmit: (content: string) => void;
};

export const CommentForm = ({ disabled = false, onSubmit }: Props) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    
    // 清除之前的错误信息
    setError(null);
    
    // 验证输入内容
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError('评论内容不能为空');
      return;
    }
    
    // 调用父组件传入的onSubmit回调
    onSubmit(trimmedContent);
    
    // 清空输入框
    setContent('');
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="写下你的评论..."
        disabled={disabled}
        maxLength={200}
      />
      {error && <p className="error-text">{error}</p>}
      <div className="comment-form__actions">
        <span>{content.length}/200</span>
        <button type="submit" disabled={disabled || !content.trim()}>
          发表评论
        </button>
      </div>
    </form>
  );
};