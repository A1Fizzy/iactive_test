export type ColumnType = 'left' | 'center' | 'right';
export type SortOrder = 'newest' | 'oldest';
export type FilterType = 'all' | 'favorite';

export interface Attachment {
  url: string;
  type: 'image' | 'video' | string;
}

export interface Message {
  id: number | string;
  author: string;
  text: string;
  date: string;
  time: string;
  attachments: Attachment[];
  isFavorite: boolean;
  column: ColumnType;
}

export interface BackendMessage {
  id: string;
  author: string;
  content: string;
  date: string;
  attachments: Array<{ url: string; type: string }>;
}