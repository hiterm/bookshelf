import { useAuth0 } from "@auth0/auth0-react";
import { ActionIcon, Burger, Group, Menu, Title } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import React from "react";
import { Link } from "react-router-dom";

type HeaderProps = { onBurgerClick: () => void; burgerOpened: boolean };

export const HeaderContents: React.FC<HeaderProps> = ({
  onBurgerClick,
  burgerOpened: burgerOpened,
}) => {
  const { isAuthenticated, user, logout } = useAuth0();

  const handleSignOut = async () => {
    await logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <Group justify="space-between" align="center" style={{ height: "100%" }} px={20}>
      <Group>
        <Burger opened={burgerOpened} onClick={onBurgerClick} hiddenFrom="sm" />
        <Title
          order={1}
          renderRoot={(props) => <Link to="/books" {...props} />}
          style={{
            color: "inherit",
            textDecoration: "none",
          }}
        >
          Bookshelf
        </Title>
      </Group>
      <Menu>
        <Menu.Target>
          <ActionIcon variant="default">
            <IconUser />
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
  );
};
