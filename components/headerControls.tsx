'use client';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setSortOrder, setFilter } from '../store/messagesSlice';

const HeaderControls: React.FC = () => {
  const sortOrder = useSelector((state: RootState) => state.messages.sortOrder);
  const filter = useSelector((state: RootState) => state.messages.filter);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div className="flex items-center gap-3 text-sm">
      <label className="text-gray-700">Сортировка:</label>
      <select
        value={sortOrder}
        onChange={(e) => dispatch(setSortOrder(e.target.value as any))}
        className="border border-gray-300 rounded px-2 py-1 text-sm"
      >
        <option value="newest">Новые сверху</option>
        <option value="oldest">Старые сверху</option>
      </select>

      <label className="text-gray-700">Фильтр:</label>
      <select
        value={filter}
        onChange={(e) => dispatch(setFilter(e.target.value as any))}
        className="border border-gray-300 rounded px-2 py-1 text-sm"
      >
        <option value="all">Все сообщения</option>
        <option value="favorite">Избранное</option>
      </select>
    </div>
  );
};

export default HeaderControls;