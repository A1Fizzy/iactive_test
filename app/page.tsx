'use client';

import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchInitialMessages, fetchMessages } from '../store/messagesSlice';
import Column from '../components/column';

export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { messages, loading, error, highestMessageId } = useSelector((state: RootState) => state.messages);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Функция для загрузки новых сообщений
  const loadNewMessages = async () => {
    try {
      await dispatch(fetchMessages({ messageId: highestMessageId || 0 }));
    } catch (err) {
      console.error('Failed to load new messages:', err);
    }
  };

  useEffect(() => {
    // Загружаем начальные сообщения
    dispatch(fetchInitialMessages());

    // Запускаем polling
    intervalRef.current = setInterval(loadNewMessages, 5000);

    // Очистка при размонтировании
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dispatch]);

  return (
    <div className="flex gap-5 p-5 h-screen bg-gray-100 overflow-hidden">
      <Column columnId="left" title="Левый" />
      <Column columnId="center" title="Центр" />
      <Column columnId="right" title="Правый" />
    </div>
  );
}