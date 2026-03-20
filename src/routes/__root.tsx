import { useAuth0 } from "@auth0/auth0-react";
import { Alert, AppShell, Button, Center, Loader } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { devtoolsExchange } from "@urql/devtools";
import React, { Fragment, memo, useMemo } from "react";
import { createClient, defaultExchanges, Provider as UrqlProvider } from "urql";
import { ChildrenProps } from "../compoments/ChildrenProps";
import { HeaderContents } from "../compoments/layout/Header";
import { NavbarContents } from "../compoments/layout/Navbar";
import { isDemoMode } from "../config";
import { SignInScreen } from "../features/auth/SignInScreen";
import {
  useLoggedInUserQuery,
  useRegisterUserMutation,
} from "../generated/graphql";

export type RouterContext = {
  auth: {
    isAuthenticated: boolean;
  };
};

const SignInCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth0();

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

  const client = useMemo(
    () =>
      createClient({
        url: import.meta.env.VITE_BOOKSHELF_API,
        fetchOptions: () => {
          return {
            headers: { authorization: `Bearer ${query.data ?? ""}` },
          };
        },
        exchanges: [devtoolsExchange, ...defaultExchanges],
      }),
    [query.data],
  );

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

  return <UrqlProvider value={client}>{children}</UrqlProvider>;
};

const DemoUrqlProvider: React.FC<ChildrenProps> = ({ children }) => {
  const client = createClient({
    url: import.meta.env.VITE_BOOKSHELF_API,
    exchanges: [devtoolsExchange, ...defaultExchanges],
  });
  return <UrqlProvider value={client}>{children}</UrqlProvider>;
};

const BranchingUrqlProvider = isDemoMode ? DemoUrqlProvider : MyUrqlProvider;
const BranchingSignInCheck = isDemoMode ? Fragment : SignInCheck;

const MainContent = memo(function MainContent(): React.JSX.Element {
  return (
    <BranchingSignInCheck>
      <BranchingUrqlProvider>
        <RegisterCheck>
          <Alert
            color="yellow"
            mb="md"
            style={{
              display: isDemoMode ? undefined : "none",
            }}
          >
            This is a read-only demo app. Update operations will not be
            reflected.
          </Alert>
          <Outlet />
        </RegisterCheck>
      </BranchingUrqlProvider>
    </BranchingSignInCheck>
  );
});

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  const [opened, handlers] = useDisclosure(false);

  return (
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
        <MainContent />
      </AppShell.Main>
    </AppShell>
  );
}
