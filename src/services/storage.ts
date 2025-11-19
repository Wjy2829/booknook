import { supabase } from '@/lib/supabaseClient';

const generateFilePath = (folder: string, filename: string) => {
  const ext = filename.split('.').pop();
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 10);
  return `${folder}/${timestamp}-${random}.${ext}`;
};

const uploadFile = async (bucket: string, folder: string, file: File) => {
  const path = generateFilePath(folder, file.name);
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data.publicUrl) {
    throw new Error('获取公共 URL 失败');
  }
  return data.publicUrl;
};

export const uploadAvatar = (file: File) => uploadFile('avatars', 'uploads', file);

export const uploadBookCover = (file: File) => uploadFile('book-covers', 'uploads', file);