// components/Column.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import MessageCard from './messageCard';
import HeaderControls from './headerControls';
import { moveMessage, fetchMessages } from '../store/messagesSlice';
import { Message, ColumnType } from '../types';

interface ColumnProps {
  columnId: ColumnType;
  title: string;
}

const Column: React.FC<ColumnProps> = ({ columnId, title }) => {
  const dispatch = useDispatch<AppDispatch>();
  const messages = useSelector((state: RootState) =>
    state.messages.messages.filter((msg) => msg.column === columnId)
  );
  const sortOrder = useSelector((state: RootState) => state.messages.sortOrder);
  const filter = useSelector((state: RootState) => state.messages.filter);

  const sortedMessages = [...messages].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const filteredMessages = sortedMessages.filter((msg) =>
    filter === 'favorite' ? msg.isFavorite : true
  );

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (columnId === 'center' && sortOrder === 'newest') {
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [filteredMessages, columnId, sortOrder]);

  const handleMove = (messageId: number | string, targetColumn: ColumnType) => {
    dispatch(moveMessage({ messageId, targetColumn }));
  };

  const handleLoadPrevious = () => {
    dispatch(fetchMessages({ oldMessages: true }));
  };

  return (
    <div className="flex-1 bg-white rounded-lg p-4 flex flex-col shadow-sm overflow-hidden text-[#808080]">
      <div className="flex flex-col justify-between items-center mb-4 pb-2 border-b border-gray-200">
        <h3 className="font-bold text-lg">{title}</h3>
        {columnId === 'center' && <HeaderControls />}
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-3"
      >
        {filteredMessages.map((msg) => (
            <MessageCard
              key={`${msg.id}-${msg.column}`}
              message={msg}
              currentColumn={columnId}
              onMove={handleMove}
            />
        ))}
      </div>

      {columnId === 'center' && (
        <div className="mt-4 text-center">
          <button
            onClick={handleLoadPrevious}
            className="duration-300 ease-in-out px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            ЗАГРУЗИТЬ ПРЕДЫДУЩИЕ
          </button>
        </div>
      )}
    </div>
  );
};

export default Column;