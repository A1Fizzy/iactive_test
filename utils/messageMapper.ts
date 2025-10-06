import { BackendMessage, Message, ColumnType } from '../types';

export const mapBackendToMessage = (
  msg: BackendMessage,
  column: ColumnType = 'center'
): Message => ({
  id: msg.id,
  author: msg.author,
  text: msg.content,
  date: msg.date,
  time: new Date(msg.date.replace(' ', 'T')).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  }),
  attachments: (msg.attachments || []).map(att => ({
    url: att.url.trim(),
    type: att.type || 'image',
  })),
  isFavorite: false,
  column,
});