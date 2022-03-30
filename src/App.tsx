import { CircularProgress } from '@mui/material';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import {
  createTheme,
  ThemeProvider,
  StyledEngineProvider,
} from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppBar } from './AppBar';
import { firebase } from './Firebase';
import { SignInScreen } from './SignInScreen';
import { MainRoutes } from './pages/MainRoutes';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';

const SignInCheck: React.FC = ({ children }) => {
  const auth = firebase.auth();
  const [firebaseUser, loading, error] = useAuthState(auth);
  const { isAuthenticated, isLoading } = useAuth0();

  if (loading || isLoading) {
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
  if (firebaseUser != null && isAuthenticated) {
    return <>{children}</>;
  }
  return <SignInScreen />;
};

const App: React.FC<{}> = () => {
  const notistackRef = React.useRef<SnackbarProvider>(null);
  const onClickDismiss = (key: string) => () => {
    notistackRef.current?.closeSnackbar(key);
  };

  const theme = createTheme();

  return (
    <React.Fragment>
      <CssBaseline />
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Auth0Provider
            domain={import.meta.env.VITE_AUTH0_DOMAIN}
            clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
            redirectUri={window.location.origin}
          >
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
          </Auth0Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    </React.Fragment>
  );
};

export default App;
