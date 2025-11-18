import { ChangeEvent, FormEvent, useState } from 'react';

type ShareEditorProps = {
  initialValue?: {
    title?: string;
    author?: string;
    cover_url?: string | null;
    review?: string;
  };
  onSubmit: (data: { title: string; author: string; cover_url: string | null; review: string }) => Promise<void>;
  onUploadCover: (file: File) => Promise<string>;
};

export const ShareEditor = ({ initialValue, onSubmit, onUploadCover }: ShareEditorProps) => {
  const [title, setTitle] = useState(initialValue?.title ?? '');
  const [author, setAuthor] = useState(initialValue?.author ?? '');
  const [review, setReview] = useState(initialValue?.review ?? '');
  const [cover, setCover] = useState<string | null>(initialValue?.cover_url ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);

  const handleCoverChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      window.alert('请上传有效的图片文件（JPG、PNG、GIF、WebP）');
      return;
    }
    
    // 验证文件大小（限制为5MB）
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      window.alert('文件大小不能超过5MB');
      return;
    }
    
    setIsCoverUploading(true);
    try {
      // 现在即使上传失败也会返回占位图像，所以不需要显示错误提示
      const url = await onUploadCover(file);
      setCover(url);
    } catch (error) {
      // 已经在服务层处理了错误，这里只记录日志
      console.error('封面处理过程中出错', error);
    } finally {
      setIsCoverUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !author.trim() || !review.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        author: author.trim(),
        review: review.trim(),
        cover_url: cover,
      });
    } catch (error) {
      console.error('分享提交失败', error);
      window.alert('提交失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="share-editor" onSubmit={handleSubmit}>
      <label>
        书名
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="必填" />
      </label>
      <label>
        作者
        <input value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="必填" />
      </label>
      <label className="cover-field">
        封面?
        {cover && <img src={cover} alt={title} />}
        <input
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
          disabled={isSubmitting || isCoverUploading}
        />
      </label>
      <label>
        推荐理由（500 字内）
        <textarea value={review} maxLength={500} onChange={(event) => setReview(event.target.value)} />
      </label>
      <button
        type="submit"
        disabled={isSubmitting || isCoverUploading || !title.trim() || !author.trim() || !review.trim()}
      >
        {isSubmitting ? '提交中...' : isCoverUploading ? '封面上传中...' : '发布'}
      </button>
    </form>
  );
};