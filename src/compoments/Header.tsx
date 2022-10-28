import { useAuth0 } from '@auth0/auth0-react';
import {
  ActionIcon,
  Anchor,
  Burger,
  Group,
  Header as MantineHeader,
  MediaQuery,
  Menu,
  Title,
} from '@mantine/core';
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'tabler-icons-react';

type HeaderProps = { onBurgerClick: () => void; burgerOpend: boolean };

export const Header: React.FC<HeaderProps> = ({
  onBurgerClick,
  burgerOpend,
}) => {
  const { isAuthenticated, user, logout } = useAuth0();

  const handleSignOut = () => {
    logout({ returnTo: window.location.origin });
  };

  return (
    <MantineHeader height={70} sx={{ paddingLeft: 20, paddingRight: 20 }}>
      <Group position="apart" align="center" sx={{ height: '100%' }}>
        <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
          <Burger opened={burgerOpend} onClick={onBurgerClick} />
        </MediaQuery>
        <Anchor variant="text" component={Link} to="/books">
          <Title order={1}>Bookshelf</Title>
        </Anchor>
        <Menu>
          <Menu.Target>
            <ActionIcon variant="default">
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
