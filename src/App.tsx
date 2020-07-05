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

const App: React.FC<{}> = () => {
  return (
    <Container>
      <CssBaseline />
      <h1>Bookshelf</h1>
      <Router>
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
      </Router>
    </Container>
  );
};

export default App;
