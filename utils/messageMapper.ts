import { BackendMessage, Message, ColumnType } from '../types';

export const mapBackendToMessage = (
  msg: BackendMessage,
  column: ColumnType = 'center'
): Message => ({
  id: msg.id,
  author: msg.author,
  text: msg.content, // ← content из бэка → text в нашем приложении
  date: msg.date,
  time: new Date(msg.date.replace(' ', 'T')).toLocaleTimeString('ru-RU'),
  attachments: (msg.attachments || []).map(att => ({
    url: att.url.trim(), // убираем пробелы
    type: att.type || 'image',
  })),
  isFavorite: false,
  column,
});