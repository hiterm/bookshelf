import { Drawer, Navbar as MantineNavbar, NavLink } from '@mantine/core';
import { Link } from 'react-router-dom';

type LinksProps = { closeNavbar: () => void };
type NavbarProps = { opened: boolean; closeNavbar: () => void };

const Links: React.FC<LinksProps> = ({ closeNavbar }) => {
  return (
    <>
      <NavLink label="本" component={Link} to="/books" onClick={closeNavbar} />
      <NavLink
        label="著者"
        component={Link}
        to="/authors"
        onClick={closeNavbar}
      />
    </>
  );
};

export const Navbar: React.FC<NavbarProps> = ({ opened, closeNavbar }) => {
  return (
    <>
      <MantineNavbar
        p="md"
        hiddenBreakpoint="sm"
        hidden={true}
        width={{ sm: 200, lg: 300 }}
      >
        <Links closeNavbar={closeNavbar} />
      </MantineNavbar>
      <Drawer opened={opened} onClose={closeNavbar}>
        <Links closeNavbar={closeNavbar} />
      </Drawer>
    </>
  );
};
