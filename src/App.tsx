import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { SnackbarProvider, WithSnackbarProps } from 'notistack';
import React from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import { AppBar } from './AppBar';
import { Books } from './book/Books';
import { SignInScreen } from './SignInScreen';

const App: React.FC<{}> = () => {
  const notistackRef = React.useRef<WithSnackbarProps>();
  const onClickDismiss = (key: string) => () => {
    notistackRef.current?.closeSnackbar(key);
  };

  const theme = createMuiTheme();

  return (
    <React.Fragment>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <Router>
          <AppBar />
          <Container>
            <SnackbarProvider
              ref={notistackRef}
              action={(key: string) => (
                <Button onClick={onClickDismiss(key)}>Dismiss</Button>
              )}
            >
              <Switch>
                <Route exact path="/">
                  <Redirect to="/books" />
                </Route>
                <Route path="/books">
                  <Books />
                </Route>
                <Route path="/signin">
                  <SignInScreen />
                </Route>
              </Switch>
            </SnackbarProvider>
          </Container>
        </Router>
      </ThemeProvider>
    </React.Fragment>
  );
};

export default App;
