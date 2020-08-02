/** @jsx jsx */
import { jsx } from '@emotion/core';
import MuiAppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import MuiLink from '@material-ui/core/Link';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

export const AppBar: React.FC = () => {
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
        <Button color="inherit">Login</Button>
      </Toolbar>
    </MuiAppBar>
  );
};
