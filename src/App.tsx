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
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppBar } from './AppBar';
import { SignInScreen } from './SignInScreen';
import { MainRoutes } from './pages/MainRoutes';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { createClient, defaultExchanges, Provider as UrqlProvider } from 'urql';
import {
  useLoggedInUserQuery,
  useRegisterUserMutation,
} from './generated/graphql';
import { devtoolsExchange } from '@urql/devtools';

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

const RegisterCheck: React.FC = ({ children }) => {
  const [result, reexecuteQuery] = useLoggedInUserQuery();
  const { data, fetching, error } = result;

  const [registerUserResult, registerUser] = useRegisterUserMutation();

  if (error != null) {
    return (
      <>
        <div>query error: {JSON.stringify(error)}</div>
        <div>register: {JSON.stringify(registerUserResult)}</div>
        <div>
          <button
            onClick={async () => {
              await registerUser();
              reexecuteQuery();
            }}
          >
            register user
          </button>
        </div>
      </>
    );
  }

  if (fetching || data == null) {
    return <>loading</>;
  }

  return <>{children}</>;
};

const AppWithSuccessedLogin: React.FC = () => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      if (isAuthenticated) {
        const accessToken = await getAccessTokenSilently();
        setToken(accessToken);
      }
    };
    getToken();
  }, [isAuthenticated]);

  if (token == null) {
    return <>loading</>;
  }

  const client = createClient({
    url: import.meta.env.VITE_BOOKSHELF_API,
    fetchOptions: () => {
      return {
        headers: { authorization: `Bearer ${token}` },
      };
    },
    exchanges: [devtoolsExchange, ...defaultExchanges],
  });

  return (
    <UrqlProvider value={client}>
      <RegisterCheck>
        <MainRoutes />
      </RegisterCheck>
    </UrqlProvider>
  );
};

const App: React.FC = () => {
  const notistackRef = React.useRef<SnackbarProvider>(null);
  const onClickDismiss = (key: string) => () => {
    notistackRef.current?.closeSnackbar(key);
  };

  const theme = createTheme();

  return (
    <React.Fragment>
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
        audience={import.meta.env.VITE_AUTH0_AUDIENCE}
        redirectUri={window.location.origin}
      >
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
                    <AppWithSuccessedLogin />
                  </SignInCheck>
                </SnackbarProvider>
              </Container>
            </Router>
          </ThemeProvider>
        </StyledEngineProvider>
      </Auth0Provider>
    </React.Fragment>
  );
};

export default App;
