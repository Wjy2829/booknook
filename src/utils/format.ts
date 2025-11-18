import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatRelativeTime = (dateString: string) =>
  formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: zhCN });

export const limitText = (text: string, limit = 120) =>
  text.length > limit ? `${text.slice(0, limit)}…` : text;

