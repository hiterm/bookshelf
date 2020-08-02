import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { SnackbarProvider, WithSnackbarProps } from 'notistack';
import React from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
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
        <Container>
          <h1>Bookshelf</h1>
          <Router>
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
          </Router>
        </Container>
      </ThemeProvider>
    </React.Fragment>
  );
};

export default App;
