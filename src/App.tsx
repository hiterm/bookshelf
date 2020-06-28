import React from 'react';
import { BookshelfApp } from './BookshelfApp';
import { SignInScreen } from './SignInScreen';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';

const App: React.FC<{}> = () => {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/signin">
            <SignInScreen />
          </Route>
          <Route path="/">
            <BookshelfApp />
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

export default App;
