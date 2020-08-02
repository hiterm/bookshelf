/** @jsx jsx */
import { jsx } from '@emotion/core';
import MuiAppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import MuiLink from '@material-ui/core/Link';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';

export const AppBar: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <MuiAppBar position="static" css={{ marginBottom: 50 }}>
      <Toolbar>
        <Typography variant="h5" color="inherit" css={{ flexGrow: 1 }}>
          <MuiLink
            component={RouterLink}
            to="/books"
            color="inherit"
            underline="none"
          >
            Bookshelf
          </MuiLink>
        </Typography>
        {
          // <Button color="inherit">Login</Button>
        }
        <IconButton
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
          onClick={handleClick}
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
          <MenuItem>Profile</MenuItem>
          <MenuItem onClick={handleClose}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </MuiAppBar>
  );
};
