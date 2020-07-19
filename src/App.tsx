import React from 'react';
import { Books } from './book/Books';
import { SignInScreen } from './SignInScreen';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import { SnackbarProvider, WithSnackbarProps } from 'notistack';
import Button from '@material-ui/core/Button';

const App: React.FC<{}> = () => {
  const notistackRef = React.useRef<WithSnackbarProps>();
  const onClickDismiss = (key: string) => () => {
    notistackRef.current?.closeSnackbar(key);
  };

  return (
    <Container>
      <CssBaseline />
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
  );
};

export default App;
