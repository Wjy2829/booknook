import { ChangeEvent, useState } from 'react';
import type { Profile } from '@/types';

type Props = {
  profile: Profile;
  onUpdate: (payload: Partial<Pick<Profile, 'username' | 'bio' | 'avatar_url'>>) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<string>;
};

export const ProfileCard = ({ profile, onUpdate, onUploadAvatar }: Props) => {
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsSaving(true);
    const url = await onUploadAvatar(file);
    await onUpdate({ avatar_url: url });
    setIsSaving(false);
  };

  const handleSubmit = async () => {
    if (!username.trim()) return;
    setIsSaving(true);
    await onUpdate({ username: username.trim(), bio });
    setIsSaving(false);
  };

  return (
    <section className="profile-card">
      <label className="avatar-upload">
        <img src={profile.avatar_url ?? `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`} alt={profile.username} />
        <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={isSaving} />
        <span>更换头像</span>
      </label>
      <div className="profile-info">
        <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="昵称" disabled={isSaving} />
        <textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          placeholder="一句话简介"
          maxLength={80}
          disabled={isSaving}
        />
        <button type="button" onClick={handleSubmit} disabled={isSaving || !username.trim()}>
          {isSaving ? '保存中…' : '保存信息'}
        </button>
      </div>
    </section>
  );
};

