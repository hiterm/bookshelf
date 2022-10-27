import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { AppShell, Container, Loader, MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';

import { devtoolsExchange } from '@urql/devtools';
import React, { Fragment, useMemo } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider as UrqlProvider, createClient, defaultExchanges } from 'urql';
import { ChildrenProps } from './compoments/ChildrenProps';
import { Header } from './compoments/Header';
import { Navbar } from './compoments/Navbar';
import { SignInScreen } from './features/auth/SignInScreen';
import {
  useLoggedInUserQuery,
  useRegisterUserMutation,
} from './generated/graphql';
import { MainRoutes } from './pages/MainRoutes';

const SignInCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }
  if (isAuthenticated) {
    return <>{children}</>;
  }
  return <SignInScreen />;
};

const RegisterCheck: React.FC<ChildrenProps> = ({ children }) => {
  const context = useMemo(() => ({ additionalTypenames: ['User'] }), []);
  const [result, reexecuteQuery] = useLoggedInUserQuery({ context });
  const { data, fetching, error } = result;

  const [_registerUserResult, registerUser] = useRegisterUserMutation();

  if (error != null) {
    return (
      <>
        <div>query error: {JSON.stringify(error)}</div>
      </>
    );
  }

  if (fetching || data == null) {
    return <>loading</>;
  }

  if (data == null) {
    return <>something is wrong.</>;
  }

  if (data.loggedInUser == null) {
    return (
      <button
        onClick={async () => {
          await registerUser({});
          reexecuteQuery();
        }}
      >
        register user
      </button>
    );
  }

  return <>{children}</>;
};

const MyUrqlProvider: React.FC<ChildrenProps> = ({ children }) => {
  const { getAccessTokenSilently } = useAuth0();
  const query = useQuery(['auth0AccessToken'], getAccessTokenSilently, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  if (query.isFetching) {
    return <Loader />;
  }

  if (query.isError) {
    return <>Error: {JSON.stringify(query.error)}</>;
  }

  if (query.data == null) {
    return <>Cannot get access token.</>;
  }

  const client = createClient({
    url: import.meta.env.VITE_BOOKSHELF_API,
    fetchOptions: () => {
      return {
        headers: { authorization: `Bearer ${query.data}` },
      };
    },
    exchanges: [devtoolsExchange, ...defaultExchanges],
  });

  return <UrqlProvider value={client}>{children}</UrqlProvider>;
};

const DemoUrqlProvider: React.FC<ChildrenProps> = ({ children }) => {
  const client = createClient({
    url: import.meta.env.VITE_BOOKSHELF_API,
    exchanges: [devtoolsExchange, ...defaultExchanges],
  });
  return <UrqlProvider value={client}>{children}</UrqlProvider>;
};

const queryClient = new QueryClient();

const App: React.FC = () => {
  const BranchingUrqlProvider =
    import.meta.env.VITE_DEMO_MODE === 'true'
      ? DemoUrqlProvider
      : MyUrqlProvider;
  const BranchingSignInCheck =
    import.meta.env.VITE_DEMO_MODE === 'true' ? Fragment : SignInCheck;

  return (
    <React.Fragment>
      <QueryClientProvider client={queryClient}>
        <MantineProvider withGlobalStyles withNormalizeCSS>
          <NotificationsProvider>
            <Auth0Provider
              domain={import.meta.env.VITE_AUTH0_DOMAIN}
              clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
              audience={import.meta.env.VITE_AUTH0_AUDIENCE}
              redirectUri={window.location.origin}
            >
              <Router>
                <AppShell navbar={<Navbar />} header={<Header />}>
                  <Container>
                    <BranchingSignInCheck>
                      <BranchingUrqlProvider>
                        <RegisterCheck>
                          <MainRoutes />
                        </RegisterCheck>
                      </BranchingUrqlProvider>
                    </BranchingSignInCheck>
                  </Container>
                </AppShell>
              </Router>
            </Auth0Provider>
          </NotificationsProvider>
        </MantineProvider>
      </QueryClientProvider>
    </React.Fragment>
  );
};

export default App;
