import { useAuth0 } from '@auth0/auth0-react';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MuiAppBar from '@mui/material/AppBar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MuiLink from '@mui/material/Link';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

export const AppBar: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const { isAuthenticated, user, logout } = useAuth0();

  const handleSignOut = () => {
    logout({ returnTo: window.location.origin });
  };

  return (
    <MuiAppBar position="static" sx={{ marginBottom: 5 }}>
      <Toolbar>
        <Typography variant="h5" color="inherit" sx={{ flexGrow: 1 }}>
          <MuiLink
            component={RouterLink}
            to="/books"
            color="inherit"
            underline="none"
          >
            Bookshelf
          </MuiLink>
        </Typography>
        <IconButton
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
          onClick={handleClick}
          size="large"
        >
          <AccountCircle />
        </IconButton>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem>
            User: {isAuthenticated && user != null && user.name}
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleSignOut}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </MuiAppBar>
  );
};
