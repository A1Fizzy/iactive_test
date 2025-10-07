'use client';

import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchInitialMessages, fetchMessages } from '../store/messagesSlice';
import Column from '../components/column';

export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { highestMessageId } = useSelector((state: RootState) => state.messages); 
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const highestMessageIdRef = useRef(highestMessageId);

  useEffect(() => {
    highestMessageIdRef.current = highestMessageId;
  }, [highestMessageId]);

  // Функция для загрузки новых сообщений
  const loadNewMessages = () => {
    // Используем ref вместо замыкания
    dispatch(fetchMessages({ messageId: highestMessageIdRef.current }));
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