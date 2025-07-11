import { NavLink } from "@mantine/core";
import { Link } from "react-router-dom";

const Links: React.FC = () => {
  return (
    <>
      <NavLink label="本" component={Link} to="/books" />
      <NavLink
        label="著者"
        component={Link}
        to="/authors"
      />
    </>
  );
};

export const NavbarContents: React.FC = () => {
  return (
    <>
      <Links />
    </>
  );
};
