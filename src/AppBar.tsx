/** @jsx jsx */
import { jsx } from '@emotion/core';
import MuiAppBar from '@material-ui/core/AppBar';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MuiLink from '@material-ui/core/Link';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import AccountCircle from '@material-ui/icons/AccountCircle';
import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { firebase } from './Firebase';

export const AppBar: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [user, setUser] = useState(null as firebase.User | null);
  useEffect(() => {
    const unlisten = firebase.auth().onAuthStateChanged((user) => {
      if (user !== null) {
        setUser(user);
      }
    });
    return () => {
      unlisten();
    };
  }, []);

  const history = useHistory();
  const handleSignOut = () => {
    firebase.auth().signOut();
    history.push('/signin');
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
          <MenuItem>{user?.displayName}</MenuItem>
          <Divider />
          <MenuItem onClick={handleSignOut}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </MuiAppBar>
  );
};
