import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { BookDetailPage } from "./BookDetailPage";
import { BookIndexPage } from "./BookIndexPage";

export const BookRouter: React.FC<{}> = () => {
  const { path } = useRouteMatch();

  return (
    <React.Fragment>
      <div>
        <Switch>
          <Route exact path={path}>
            <BookIndexPage />
          </Route>
          <Route path={`${path}/:id`}>
            <BookDetailPage />
          </Route>
        </Switch>
      </div>
    </React.Fragment>
  );
};
