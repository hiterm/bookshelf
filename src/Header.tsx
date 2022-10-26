import { useAuth0 } from '@auth0/auth0-react';
import {
  ActionIcon,
  Anchor,
  Group,
  Header as MantineHeader,
  Menu,
  Title,
} from '@mantine/core';
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'tabler-icons-react';

export const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth0();

  const handleSignOut = () => {
    logout({ returnTo: window.location.origin });
  };

  return (
    <MantineHeader height={70}>
      <Anchor component={Link} to="/books">
        <Title order={1}>Bookshelf</Title>
      </Anchor>
      <Group position="right">
        <Menu>
          <Menu.Target>
            <ActionIcon>
              <User />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item>
              User: {isAuthenticated && user != null && user.name}
            </Menu.Item>
            <Menu.Item onClick={handleSignOut}>Logout</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </MantineHeader>
  );
};
