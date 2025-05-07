import { ActionIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconShare } from '@tabler/icons-react';
import { JSX } from 'react';

export const ShareButton = (): JSX.Element => {
  const handleShare = async (): Promise<void> => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Link Copied',
        message: 'URL has been copied to clipboard',
        color: 'green',
      });
    }
  };

  return (
    <ActionIcon onClick={handleShare} variant='subtle'>
      <IconShare size={20} />
    </ActionIcon>
  );
};
