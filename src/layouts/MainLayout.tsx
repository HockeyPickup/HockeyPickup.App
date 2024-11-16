import { Anchor, AppShell, Burger, Button, Group, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { authService } from '../services/auth';
import '@mantine/core/styles/Burger.css';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [opened, { toggle }] = useDisclosure();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={3}>Hockey Pickup</Title>
          </Group>
          <Group>
            {isAuthenticated ? (
              <>
                <span>Welcome, {user?.FirstName || user?.UserName}</span>
                <Anchor component={Link} to="/profile">Profile</Anchor>
                <Button variant="subtle" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <Button component={Link} to="/login">Login</Button>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}