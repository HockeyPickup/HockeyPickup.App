import styles from '@/App.module.css';
import { RatingsToggle } from '@/components/RatingsToggle';
import { useZoom } from '@/hooks/useZoom';
import { AppShell, Avatar, Burger, Group, Menu, Paper, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { FC, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService, useAuth } from '../lib/auth';
import { AvatarService } from '../services/avatar';
import { ShareButton } from './ShareButton';
import { useTitle } from './TitleContext';

export const MainLayout: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [opened, { toggle, close }] = useDisclosure();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [avatarSrc, setAvatarSrc] = useState('');
  const { title } = useTitle();
  const { canViewRatings, isAdmin, isSubAdmin } = useAuth();
  useZoom(false);

  const unpaidBuyerTransactions =
    user?.BuyerTransactions?.filter((bt) => !bt.PaymentSent && bt.SellerUserId) ?? [];
  const unconfirmedSellerTransactions =
    user?.SellerTransactions?.filter((bt) => !bt.PaymentReceived && bt.BuyerUserId) ?? [];

  const hasPendingTransactions =
    unpaidBuyerTransactions.length > 0 || unconfirmedSellerTransactions.length > 0;

  useEffect(() => {
    // Update the document title whenever the title changes
    document.title = title && title !== 'Home' ? `Hockey Pickup - ${title}` : 'Hockey Pickup';
  }, [title]);

  useEffect(() => {
    const updateAvatar = async (): Promise<void> => {
      const avatarUrl = await AvatarService.getAvatarUrl(user?.PhotoUrl ?? '');
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
          <Menu.Item component={Link} to='/account'>
            🔒 Account
          </Menu.Item>
          <Menu.Item component={Link} to='/regulars'>
            👥 Regulars
          </Menu.Item>
          <Menu.Item component={Link} to='/players'>
            📋 Players
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item component={Link} to='/game-pucks'>
            🏆 Game Pucks
          </Menu.Item>
          <Menu.Item component={Link} to='/newsletters'>
            📰 Newsletters
          </Menu.Item>
          <Menu.Item component={Link} to='/goalie-lounge'>
            🥅 Goalie Lounge
          </Menu.Item>
          <Menu.Item component={Link} to='/calendar'>
            📅 Calendar
          </Menu.Item>
          <Menu.Divider />
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
              <ShareButton />
            </Group>
            <Text className={`${styles.pageTitle} ${styles.noZoom}`}>{title}</Text>
            {/* Right section with avatar and burger menu */}
            <Group gap='xs' className={styles.noZoom}>
              <Link to='/account'>
                <Avatar
                  src={user ? avatarSrc : null}
                  alt={user?.FirstName ?? 'Account'}
                  radius='xl'
                  size='md'
                  className={`${styles.avatar} ${styles.noZoom}`}
                  key={user?.PhotoUrl}
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
            </Group>
          </Group>
        </div>
      </AppShell.Header>
      {hasPendingTransactions && (
        <Paper
          withBorder
          shadow='sm'
          p='xs'
          radius='md'
          mb='md'
          bg='yellow.1'
          style={{
            position: 'sticky',
            top: 60,
            zIndex: 100,
            borderLeft: '4px solid #FFD700',
          }}
        >
          <Group justify='center' gap='xs'>
            <Text size='sm' c='dark.7' fw={500}>
              You have{' '}
              {unpaidBuyerTransactions.length > 0 && (
                <>
                  {unpaidBuyerTransactions.length} unpaid session
                  {unpaidBuyerTransactions.length !== 1 ? 's' : ''}
                  {unconfirmedSellerTransactions.length > 0 ? ' and ' : ''}
                </>
              )}
              {unconfirmedSellerTransactions.length > 0 &&
                `${unconfirmedSellerTransactions.length} payment${unconfirmedSellerTransactions.length !== 1 ? 's' : ''} not marked received`}
              .{' '}
              <Link
                to='/account'
                style={{ color: '#228be6', textDecoration: 'underline', fontWeight: 600 }}
              >
                View
              </Link>{' '}
              to resolve.
            </Text>
          </Group>
        </Paper>
      )}
      <AppShell.Main className={styles.main}>{children}</AppShell.Main>
      <AppShell.Footer className={styles.footer}>
        <Group justify='center' gap='xs'>
          <Text size='xs'>
            © {new Date().getFullYear()} John Bryan&apos;s Pickup Hockey, Est. 2004
          </Text>
          <Text size='xs' className={styles.footerBulletDesktop}>
            •
          </Text>
          <span className={styles.footerMobileBreak} />
          <Link to='/privacy' className={styles.footerLink}>
            Privacy
          </Link>
          <Text size='xs'>•</Text>
          <Link to='/about' className={styles.footerLink}>
            About
          </Link>
          <RatingsToggle canViewRatings={canViewRatings()} />
        </Group>
        {isAdmin() || isSubAdmin() ? (
          <Group justify='center' gap='xs'>
            <Text size='xs'>
              Role{isAdmin() && isSubAdmin() && 's'}: {isAdmin() && 'Admin'}
              {isAdmin() && isSubAdmin() && ', '}
              {isSubAdmin() && 'SubAdmin'}
            </Text>
          </Group>
        ) : null}
      </AppShell.Footer>
    </AppShell>
  );
};
