import styles from '@/App.module.css';
import { RatingsToggle } from '@/components/RatingsToggle';
import { useZoom } from '@/hooks/useZoom';
import { AppShell, Avatar, Burger, Group, Menu, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { FC, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService, useAuth } from '../lib/auth';
import { AvatarService } from '../services/avatar';
import { useTitle } from './TitleContext';

export const MainLayout: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [opened, { toggle, close }] = useDisclosure();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [avatarSrc, setAvatarSrc] = useState('');
  const { title } = useTitle();
  const { canViewRatings } = useAuth();
  useZoom(false);

  useEffect(() => {
    // Update the document title whenever the title changes
    document.title = title && title !== 'Home' ? `Hockey Pickup - ${title}` : 'Hockey Pickup';
  }, [title]);

  useEffect(() => {
    const updateAvatar = async (): Promise<void> => {
      const avatarUrl = await AvatarService.getAvatarUrl(
        user?.Email ?? '',
        user ? `${user.FirstName} ${user.LastName}` : '',
        {
          size: 40,
          fallbackType: 'initials',
        },
      );
      setAvatarSrc(avatarUrl);
    };

    updateAvatar();
  }, [user]);

  const handleLogout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
      close();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      close();
      navigate('/login');
    }
  };

  const MenuItems: FC = () => (
    <>
      {user ? (
        <>
          <Menu.Item component={Link} to='/sessions'>
            🏒 Sessions
          </Menu.Item>
          <Menu.Item component={Link} to='/players'>
            📋 Players
          </Menu.Item>
          <Menu.Item component={Link} to='/regulars'>
            👥 Regulars
          </Menu.Item>
          <Menu.Item component={Link} to='/game-pucks'>
            🏆 Game Pucks
          </Menu.Item>
          <Menu.Item component={Link} to='/goalie-lounge'>
            🥅 Goalie Lounge
          </Menu.Item>
          <Menu.Item component={Link} to='/calendar'>
            📅 Calendar
          </Menu.Item>
          <Menu.Item onClick={handleLogout}>↪️ Logout</Menu.Item>
        </>
      ) : (
        <Menu.Item component={Link} to='/login'>
          ↩️ Login
        </Menu.Item>
      )}
    </>
  );

  return (
    <AppShell header={{ height: 60 }} padding='md' className={styles.root}>
      <AppShell.Header className={styles.fixedHeader}>
        <div className={styles.headerWrapper}>
          <Group h='100%' px='md' justify='space-between' wrap='nowrap'>
            {/* Left section with logo */}
            <Group className={styles.noZoom}>
              <Link to='/' className={styles.logo}>
                <img src='/static/JB_Puck_Logo.png' alt='Hockey Pickup' height={40} />
              </Link>
            </Group>
            <Text className={`${styles.pageTitle} ${styles.noZoom}`}>{title}</Text>
            {/* Right section with avatar and burger menu */}
            <Group gap='xs' className={styles.noZoom}>
              <Link to='/profile'>
                <Avatar
                  src={user ? avatarSrc : null}
                  alt={user?.FirstName ?? 'Profile'}
                  radius='xl'
                  size='md'
                  className={`${styles.avatar} ${styles.noZoom}`}
                />
              </Link>

              <Menu
                position='bottom-end'
                offset={14}
                shadow='md'
                width={200}
                opened={opened}
                onChange={toggle}
                onClose={close}
              >
                <Menu.Target>
                  <Burger opened={opened} onClick={toggle} className={styles.noZoom} />
                </Menu.Target>
                <Menu.Dropdown>
                  <MenuItems />
                </Menu.Dropdown>
              </Menu>
            </Group>{' '}
          </Group>{' '}
        </div>
      </AppShell.Header>
      <AppShell.Main className={styles.main}>{children}</AppShell.Main>
      <AppShell.Footer className={styles.footer}>
        <Group justify='center' gap='xs'>
          <Text size='xs'>© {new Date().getFullYear()} Hockey Pickup, Est. 2004</Text>
          <Text size='xs'>•</Text>
          <Link to='/privacy' className={styles.footerLink}>
            Privacy
          </Link>
          <Text size='xs'>•</Text>
          <Link to='/about' className={styles.footerLink}>
            About
          </Link>
          <RatingsToggle canViewRatings={canViewRatings()} />
        </Group>
      </AppShell.Footer>
    </AppShell>
  );
};
