import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useGoogleAnalytics = (): {
  trackEvent: (_action: string, _category: string, _label?: string) => void;
} => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', 'G-295593998', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  const trackEvent = (action: string, category: string, label?: string): void => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
      });
    }
  };

  return { trackEvent };
};

export default useGoogleAnalytics;
