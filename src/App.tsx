import React from 'react';
import { BookshelfApp } from './BookshelfApp';
import { SignInScreen } from './SignInScreen';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import './App.css';

const App: React.FC<{}> = () => {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/">
            <Redirect to="/books" />
              </Route>
          <Route path="/books">
            <BookshelfApp />
          </Route>
          <Route path="/signin">
            <SignInScreen />
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

export default App;
