import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { Outlet } from '@tanstack/react-router';
import { Alert, AppShell, Button, Center, Loader, MantineProvider } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { devtoolsExchange } from "@urql/devtools";
import React, { Fragment, memo, useMemo } from "react";
// TanStack Router への移行のため、react-router-dom の import を削除
import { RecoilRoot } from "recoil";
import { RecoilURLSyncJSON } from "recoil-sync";
import { createClient, defaultExchanges, Provider as UrqlProvider } from "urql";
import { ChildrenProps } from "./compoments/ChildrenProps";
import { HeaderContents } from "./compoments/layout/Header";
import { NavbarContents } from "./compoments/layout/Navbar";
import { SignInScreen } from "./features/auth/SignInScreen";
import { useLoggedInUserQuery, useRegisterUserMutation } from "./generated/graphql";
// import { MainRoutes } from "./pages/MainRoutes";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

const SignInCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }
  if (isAuthenticated) {
    return <>{children}</>;
  }
  return <SignInScreen />;
};

const RegisterCheck: React.FC<ChildrenProps> = ({ children }) => {
  const context = useMemo(() => ({ additionalTypenames: ["User"] }), []);
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
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  if (data.loggedInUser == null) {
    return (
      <Center>
        <Button
          onClick={async () => {
            await registerUser({});
            reexecuteQuery();
          }}
        >
          Register user
        </Button>
      </Center>
    );
  }

  return <>{children}</>;
};

const MyUrqlProvider: React.FC<ChildrenProps> = ({ children }) => {
  const { getAccessTokenSilently } = useAuth0();
  const query = useQuery({
    queryKey: ["auth0AccessToken"],
    queryFn: () => getAccessTokenSilently(),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  if (query.isFetching) {
    return (
      <Center>
        <Loader />
      </Center>
    );
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

const BranchingUrqlProvider = import.meta.env.VITE_DEMO_MODE === "true"
  ? DemoUrqlProvider
  : MyUrqlProvider;
const BranchingSignInCheck = import.meta.env.VITE_DEMO_MODE === "true"
  ? Fragment
  : SignInCheck;

const MainContent = memo(function MainContent(): JSX.Element {
  return (
    <BranchingSignInCheck>
      <BranchingUrqlProvider>
        <RegisterCheck>
          <Alert
            color="yellow"
            mb="md"
            style={{
              display: import.meta.env.VITE_DEMO_MODE === "true"
                ? undefined
                : "none",
            }}
          >
            This is a read-only demo app. Update operations will not be reflected.
          </Alert>
          {/* TanStack Router でルーティングを管理するため MainRoutes を削除 */}
        </RegisterCheck>
      </BranchingUrqlProvider>
    </BranchingSignInCheck>
  );
});

const App: React.FC = () => {
  const [opened, handlers] = useDisclosure(false);

  return (
    <RecoilRoot>
      {/* There is bug with fast refresh and Firefox. */}
      {/* https://github.com/facebookexperimental/Recoil/issues/1994 */}
      <RecoilURLSyncJSON location={{ part: "queryParams" }}>
        <QueryClientProvider client={queryClient}>
          <MantineProvider>
            <Notifications />
            <Auth0Provider
              domain={import.meta.env.VITE_AUTH0_DOMAIN}
              clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
              authorizationParams={{
                audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                redirect_uri: window.location.origin,
              }}
            >
              <BranchingUrqlProvider>
                <RegisterCheck>
                  <AppShell
                    header={{ height: 70 }}
                    navbar={{
                      width: 300,
                      breakpoint: "sm",
                      collapsed: { mobile: !opened },
                    }}
                    padding="md"
                  >
                    <AppShell.Header>
                      <HeaderContents burgerOpened={opened} onBurgerClick={handlers.toggle} />
                    </AppShell.Header>
                    <AppShell.Navbar p="md">
                      <NavbarContents />
                    </AppShell.Navbar>
                    <AppShell.Main>
                      <Alert
                        color="yellow"
                        mb="md"
                        style={{
                          display: import.meta.env.VITE_DEMO_MODE === "true"
                            ? undefined
                            : "none",
                        }}
                      >
                        This is a read-only demo app. Update operations will not be reflected.
                      </Alert>
                      <Outlet />
                    </AppShell.Main>
                  </AppShell>
                </RegisterCheck>
              </BranchingUrqlProvider>
            </Auth0Provider>
          </MantineProvider>
        </QueryClientProvider>
      </RecoilURLSyncJSON>
    </RecoilRoot>
  );
};

export default App;
