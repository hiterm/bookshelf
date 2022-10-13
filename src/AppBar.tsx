import { useAuth0 } from '@auth0/auth0-react';
import { Menu as MenuIcon } from '@mui/icons-material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MuiLink from '@mui/material/Link';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';

type MyDrawlerProps = { open: boolean; onClose: () => void };

const MyDrawler: React.FC<MyDrawlerProps> = (props) => {
  const history = useHistory();

  const handleBookClick = () => {
    history.push(`/books`);
    props.onClose();
  };
  const handleAuthorClick = () => {
    history.push(`/authors`);
    props.onClose();
  };

  return (
    <Drawer anchor="left" open={props.open} onClose={props.onClose}>
      <List sx={{ minWidth: 200 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={handleBookClick}>
            <ListItemText primary="本" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleAuthorClick}>
            <ListItemText primary="著者" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export const AppBar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isDrawerOpen, setIsDrawlerOpen] = useState(false);

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
      <MyDrawler
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawlerOpen(false);
        }}
      />
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={() => {
            setIsDrawlerOpen(true);
          }}
        >
          <MenuIcon />
        </IconButton>
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
