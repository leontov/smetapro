export interface GestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export const attachSwipeHandlers = (
  element: HTMLElement | null,
  { onSwipeLeft, onSwipeRight }: GestureHandlers
) => {
  if (!element) return () => undefined;

  let touchStartX = 0;
  let touchEndX = 0;

  const threshold = 60;

  const onTouchStart = (event: TouchEvent) => {
    touchStartX = event.changedTouches[0].screenX;
  };

  const onTouchMove = (event: TouchEvent) => {
    touchEndX = event.changedTouches[0].screenX;
  };

  const onTouchEnd = () => {
    const distance = touchEndX - touchStartX;
    if (distance > threshold) {
      onSwipeRight?.();
    } else if (distance < -threshold) {
      onSwipeLeft?.();
    }
  };

  element.addEventListener('touchstart', onTouchStart);
  element.addEventListener('touchmove', onTouchMove);
  element.addEventListener('touchend', onTouchEnd);

  return () => {
    element.removeEventListener('touchstart', onTouchStart);
    element.removeEventListener('touchmove', onTouchMove);
    element.removeEventListener('touchend', onTouchEnd);
  };
};
