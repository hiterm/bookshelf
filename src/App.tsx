import { CircularProgress } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppBar } from './AppBar';
import { firebase } from './Firebase';
import { SignInScreen } from './SignInScreen';
import { MainRoutes } from './pages/MainRoutes';

const SignInCheck: React.FC = ({ children }) => {
  const auth = firebase.auth();
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return (
      <div>
        <CircularProgress />
      </div>
    );
  }
  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
      </div>
    );
  }
  if (user) {
    return <>{children}</>;
  }
  return <SignInScreen />;
};

const App: React.FC<{}> = () => {
  const notistackRef = React.useRef<SnackbarProvider>(null);
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
              <SignInCheck>
                <MainRoutes />
              </SignInCheck>
            </SnackbarProvider>
          </Container>
        </Router>
      </ThemeProvider>
    </React.Fragment>
  );
};

export default App;
