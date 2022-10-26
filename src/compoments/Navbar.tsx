import { Navbar as MantineNavbar, NavLink } from '@mantine/core';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  return (
    <MantineNavbar p="md" hiddenBreakpoint="sm" width={{ sm: 200, lg: 300 }}>
      <NavLink label="本" component={Link} to="/books" />
      <NavLink label="著者" component={Link} to="/authors" />
    </MantineNavbar>
  );
};
