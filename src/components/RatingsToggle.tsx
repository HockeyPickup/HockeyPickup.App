import { ActionIcon } from '@mantine/core';
import { IconLock, IconLockOpen } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

export const RatingsToggle: React.FC<{ isAdmin?: boolean; isSubAdmin?: boolean }> = ({
  isAdmin,
  isSubAdmin,
}) => {
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

  if (!isAdmin && !isSubAdmin) return null;

  return (
    <ActionIcon
      variant='subtle'
      onClick={toggleRatings}
      size='sm'
      color={showRatings ? 'blue' : 'gray'}
      title={showRatings ? 'Hide Ratings' : 'Show Ratings'}
    >
      {showRatings ? <IconLockOpen size={16} /> : <IconLock size={16} />}
    </ActionIcon>
  );
};

// Cookie utility functions
const setRatingsCookie = (): void => {
  const expirationTime = new Date(new Date().getTime() + 30 * 60 * 1000);
  document.cookie = `ratings=true; expires=${expirationTime.toUTCString()}; path=/`;
};

const isRatingsCookieSet = (): boolean => {
  return document.cookie.split(';').some((item) => item.trim().startsWith('ratings='));
};

const deleteRatingsCookie = (): void => {
  document.cookie = 'ratings=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};
