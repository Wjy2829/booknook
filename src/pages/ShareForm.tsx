import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShareEditor } from '@/components/ShareEditor';
import { useAuth } from '@/context/AuthContext';
import { createBookShare, fetchBookShare, updateBookShare } from '@/services/bookShares';
import { uploadBookCover } from '@/services/storage';

type Props = {
  mode: 'create' | 'edit';
};

export const ShareFormPage = ({ mode }: Props) => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [initialValue, setInitialValue] = useState<
    { title?: string; author?: string; cover_url?: string | null; review?: string } | undefined
  >(undefined);

  useEffect(() => {
    if (mode === 'edit' && id) {
      fetchBookShare(id, session?.user.id).then((data) =>
        setInitialValue({
          title: data.title,
          author: data.author,
          cover_url: data.cover_url,
          review: data.review,
        }),
      );
    }
  }, [id, mode, session?.user.id]);

  const handleSubmit = async (payload: {
    title: string;
    author: string;
    cover_url: string | null;
    review: string;
  }) => {
    if (!session) {
      navigate('/auth');
      return;
    }

    if (mode === 'create') {
      const share = await createBookShare({ ...payload, user_id: session.user.id });
      navigate(`/books/${share.id}`);
    } else if (id) {
      await updateBookShare(id, payload);
      navigate(`/books/${id}`);
    }
  };

  return (
    <section className="page-container">
      <h1>{mode === 'create' ? '发布读书分享' : '编辑读书分享'}</h1>
      <ShareEditor
        initialValue={initialValue}
        onSubmit={handleSubmit}
        onUploadCover={uploadBookCover}
      />
    </section>
  );
};

