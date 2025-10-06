import { ColumnType, Message } from "@/types";

export const saveFavoritesToLocalStorage = (favorites: Record<string | number, boolean>): void => {
  try {
    localStorage.setItem('messageFavorites', JSON.stringify(favorites));
  } catch (e) {
    console.error('Не удалось сохранить избранное в localStorage', e);
  }
};

export const loadFavoritesFromLocalStorage = (): Record<string | number, boolean> => {
  try {
    const raw = localStorage.getItem('messageFavorites');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Не удалось загрузить избранное из localStorage', e);
    return {};
  }
};

export const saveColumnStateToLocalStorage = (messages: Message[]): void => {
  try {
    const columnState = messages.reduce((acc, msg) => {
      acc[msg.id] = msg.column;
      return acc;
    }, {} as Record<string | number, ColumnType>);
    localStorage.setItem('messageColumns', JSON.stringify(columnState));
  } catch (e) {
    console.error('Не удалось сохранить column в localStorage', e);
  }
};

export const loadColumnStateFromLocalStorage = (): Record<string | number, ColumnType> => {
  try {
    const raw = localStorage.getItem('messageColumns');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Не удалось загрузить column из localStorage', e);
    return {};
  }
};