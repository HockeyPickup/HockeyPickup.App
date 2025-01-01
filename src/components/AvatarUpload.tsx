import { ApiDataResponseOfPhotoResponse } from '@/HockeyPickup.Api';
import { authService, useAuth } from '@/lib/auth';
import { FileInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconUpload } from '@tabler/icons-react';
import { JSX, useState } from 'react';

interface AvatarUploadProps {
  onUploadSuccess?: () => void;
  userId?: string;
}

export const AvatarUpload = ({ onUploadSuccess, userId }: AvatarUploadProps): JSX.Element => {
  const [uploading, setUploading] = useState(false);
  const { setUser } = useAuth();

  const handleUpload = async (file: File | null): Promise<void> => {
    if (!file) return;
    setUploading(true);
    try {
      let result: ApiDataResponseOfPhotoResponse;

      if (userId) {
        // This is an Admin uploading on behalf of another user
        result = await authService.adminUploadProfileImage(userId, file);
      } else {
        // User uploading for themselves
        result = await authService.uploadProfileImage(file);
      }

      if (result.Data !== null && result.Data !== undefined) {
        await authService.refreshUser(setUser);
        notifications.show({
          position: 'top-center',
          autoClose: 5000,
          style: { marginTop: '60px' },
          title: 'Success',
          message: 'Avatar uploaded successfully',
          color: 'green',
        });
        if (onUploadSuccess) onUploadSuccess();
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Error',
        message: 'Failed to upload avatar',
        color: 'red',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <FileInput
      accept='image/png,image/jpeg,image/jpg'
      label='Upload Profile Photo (JPG or PNG)'
      placeholder='Click to select file'
      leftSection={<IconUpload size={14} />}
      onChange={handleUpload}
      disabled={uploading}
    />
  );
};
