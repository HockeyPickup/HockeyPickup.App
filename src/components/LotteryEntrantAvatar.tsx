import { LotteryEntrantResponse } from '@/HockeyPickup.Api';
import { AvatarService } from '@/services/avatar';
import { Avatar } from '@mantine/core';
import { JSX, useEffect, useState } from 'react';

interface EntrantAvatarProps {
  entrant: LotteryEntrantResponse;
  size?: number;
}

// Circular profile avatar that resolves the photo url (with default fallback) the same way the
// roster does. Used everywhere an entrant name is shown.
export const EntrantAvatar = ({ entrant, size = 32 }: EntrantAvatarProps): JSX.Element => {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    AvatarService.getAvatarUrl(entrant.PhotoUrl ?? '').then((resolved) => {
      if (active) setUrl(resolved);
    });
    return (): void => {
      active = false;
    };
  }, [entrant.PhotoUrl]);

  return (
    <Avatar src={url} alt={`${entrant.FirstName} ${entrant.LastName}`} radius='xl' size={size} />
  );
};
