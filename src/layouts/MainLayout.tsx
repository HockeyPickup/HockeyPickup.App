import { Anchor, AppShell, Burger, Button, Group, Title, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { authService } from '../services/auth';
import '@mantine/core/styles/Burger.css';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [opened, { toggle, close }] = useDisclosure();
  const { isAuthenticated, user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);  // Clear the user in context
      close();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);  // Still clear user on error
      close();
      navigate('/login');
    }
  };
  
  const handleNavigation = () => {
    close();
  };

  const NavItems = () => (
    <Stack gap="xs" align="flex-start">
      {isAuthenticated ? (
        <>
          <Anchor component={Link} to="/profile" variant="text" onClick={handleNavigation}>Profile</Anchor>
          <Anchor component="button" onClick={handleLogout} variant="text">Logout</Anchor>
        </>
      ) : (
        <Anchor component={Link} to="/login" variant="text" onClick={handleNavigation}>Login</Anchor>
      )}
    </Stack>
  );

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { desktop: true, mobile: !opened }
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={3}><Link to={'/'}>Hockey Pickup</Link></Title>
          </Group>
          <Group visibleFrom="sm">
            {isAuthenticated && <span>Welcome, {user?.FirstName || user?.UserName}</span>}
            <NavItems />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavItems />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};