import { NavLink } from "../mantineTsr";

const Links: React.FC = () => {
  return (
    <>
      <NavLink label="本" to="/books" />
      <NavLink label="著者" to="/authors" />
      <NavLink label="変更履歴" to="/history" />
      <NavLink label="設定" to="/settings/backup" />
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
