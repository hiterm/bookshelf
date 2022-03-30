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
import { BrowserRouter as Router } from 'react-router-dom';
import { AppBar } from './AppBar';
import { SignInScreen } from './SignInScreen';
import { MainRoutes } from './pages/MainRoutes';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';

const SignInCheck: React.FC = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div>
        <CircularProgress />
      </div>
    );
  }
  if (isAuthenticated) {
    return <>{children}</>;
  }
  return <SignInScreen />;
};

const AppInAuth0Provider: React.FC = () => {
  const notistackRef = React.useRef<SnackbarProvider>(null);
  const onClickDismiss = (key: string) => () => {
    notistackRef.current?.closeSnackbar(key);
  };

  const theme = createTheme();

  return (
    <>
      <CssBaseline />
      <StyledEngineProvider injectFirst>
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
      </StyledEngineProvider>
    </>
  );
};

const App: React.FC<{}> = () => {
  return (
    <React.Fragment>
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
        audience={import.meta.env.VITE_AUTH0_AUDIENCE}
        redirectUri={window.location.origin}
      >
        <AppInAuth0Provider />
      </Auth0Provider>
    </React.Fragment>
  );
};

export default App;
