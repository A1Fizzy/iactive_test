// hooks/useClickOutside.ts
import { useEffect, RefObject } from 'react';

// Тип для любого DOM элемента (включая null)
type AnyRef = RefObject<Element | null>;

const useClickOutside = (ref: AnyRef, handler: () => void) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Проверяем, что ref.current существует и не содержит target
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

export default useClickOutside;