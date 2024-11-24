import { useEffect } from 'react';

export const useZoom = (allowZoom: boolean): void => {
  useEffect(() => {
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      if (allowZoom) {
        viewport.setAttribute(
          'content',
          'width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=3.0',
        );
      } else {
        viewport.setAttribute(
          'content',
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
        );
      }
    }

    return (): void => {
      // Reset to default (no zoom) when component unmounts
      if (viewport) {
        viewport.setAttribute(
          'content',
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
        );
      }
    };
  }, [allowZoom]);
};
