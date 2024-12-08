import { ActionIcon, Text } from '@mantine/core';
import { IconLock, IconLockOpen } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

export const RatingsToggle: React.FC<{ canViewRatings?: boolean }> = ({ canViewRatings }) => {
  const { showRatings } = useRatingsVisibility();

  const toggleRatings = (): void => {
    if (isRatingsCookieSet()) {
      deleteRatingsCookie();
    } else {
      setRatingsCookie();
    }
  };

  return canViewRatings ? (
    <>
      <Text size='xs'>•</Text>
      <ActionIcon
        variant='subtle'
        onClick={toggleRatings}
        size='sm'
        color={showRatings ? 'blue' : 'gray'}
        title={showRatings ? 'Hide Ratings' : 'Show Ratings'}
      >
        {showRatings ? <IconLockOpen size={16} /> : <IconLock size={16} />}
      </ActionIcon>
    </>
  ) : (
    <></>
  );
};

export const isRatingsCookieSet = (): boolean => {
  return document.cookie.split(';').some((item) => item.trim().startsWith('ratings='));
};

// Create a shared state using an event bus pattern
const RATINGS_CHANGED_EVENT = 'ratingsVisibilityChanged';
const RATINGS_COOKIE_MINUTES = 30;

const setRatingsCookie = (): void => {
  const expirationTime = new Date(new Date().getTime() + RATINGS_COOKIE_MINUTES * 60 * 1000);
  document.cookie = `ratings=true; expires=${expirationTime.toUTCString()}; path=/`;
  // Dispatch with the current state
  window.dispatchEvent(new CustomEvent(RATINGS_CHANGED_EVENT, { detail: true }));
};

const deleteRatingsCookie = (): void => {
  document.cookie = 'ratings=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  // Dispatch with the current state
  window.dispatchEvent(new CustomEvent(RATINGS_CHANGED_EVENT, { detail: false }));
};

export const useRatingsVisibility = (): { showRatings: boolean } => {
  const [showRatings, setShowRatings] = useState(isRatingsCookieSet());

  useEffect(() => {
    // Define event handler
    const handleRatingsChange = (event: Event): void => {
      const customEvent = event as CustomEvent;
      setShowRatings(customEvent.detail ?? isRatingsCookieSet());
    };

    // Only start interval if ratings are showing
    let interval: NodeJS.Timeout | undefined;
    if (showRatings) {
      interval = setInterval(() => {
        const cookieExists = isRatingsCookieSet();
        if (!cookieExists) {
          setShowRatings(false);
        }
      }, 1000);
    }

    // Listen for changes
    window.addEventListener(RATINGS_CHANGED_EVENT, handleRatingsChange);

    return (): void => {
      if (interval) {
        clearInterval(interval);
      }
      window.removeEventListener(RATINGS_CHANGED_EVENT, handleRatingsChange);
    };
  }, [showRatings]); // Added showRatings as dependency

  return { showRatings };
};
