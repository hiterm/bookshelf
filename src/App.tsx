import { CircularProgress } from '@mui/material';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider, Theme, StyledEngineProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppBar } from './AppBar';
import { firebase } from './Firebase';
import { SignInScreen } from './SignInScreen';
import { MainRoutes } from './pages/MainRoutes';


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


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

  const theme = createTheme();

  return (
    <React.Fragment>
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
    </React.Fragment>
  );
};

export default App;
