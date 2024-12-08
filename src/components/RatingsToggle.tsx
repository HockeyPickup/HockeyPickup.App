import { ActionIcon, Text } from '@mantine/core';
import { IconLock, IconLockOpen } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

export const RatingsToggle: React.FC<{ canViewRatings?: boolean }> = ({ canViewRatings }) => {
  const [showRatings, setShowRatings] = useState(false);

  useEffect(() => {
    // Initial check for cookie
    setShowRatings(isRatingsCookieSet());

    // Periodic check
    const interval = setInterval(() => {
      setShowRatings(isRatingsCookieSet());
    }, 1000);

    return (): void => clearInterval(interval);
  }, []);

  const toggleRatings = (): void => {
    if (isRatingsCookieSet()) {
      deleteRatingsCookie();
    } else {
      setRatingsCookie();
    }
    setShowRatings(!showRatings);
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

// Define a custom event name
const RATINGS_CHANGED_EVENT = 'ratingsVisibilityChanged';

// Modify the cookie utility functions to dispatch events
const setRatingsCookie = (): void => {
  const expirationTime = new Date(new Date().getTime() + 30 * 60 * 1000);
  document.cookie = `ratings=true; expires=${expirationTime.toUTCString()}; path=/`;
  window.dispatchEvent(new Event(RATINGS_CHANGED_EVENT));
};

const deleteRatingsCookie = (): void => {
  document.cookie = 'ratings=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  window.dispatchEvent(new Event(RATINGS_CHANGED_EVENT));
};

// Update the hook to use events instead of interval
export const useRatingsVisibility = (): { showRatings: boolean } => {
  const [showRatings, setShowRatings] = useState(isRatingsCookieSet());

  useEffect(() => {
    const handleRatingsChange = (): void => {
      setShowRatings(isRatingsCookieSet());
    };

    window.addEventListener(RATINGS_CHANGED_EVENT, handleRatingsChange);
    return (): void => window.removeEventListener(RATINGS_CHANGED_EVENT, handleRatingsChange);
  }, []);

  return { showRatings };
};
