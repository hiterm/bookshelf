import { useAuth0 } from "@auth0/auth0-react";
import {
  Alert,
  AppShell,
  Button,
  Center,
  Loader,
  MantineProvider,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Notifications } from "@mantine/notifications";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { Outlet } from "@tanstack/react-router";
import { devtoolsExchange } from "@urql/devtools";
import React, { Fragment, memo } from "react";
import { createClient, defaultExchanges, Provider as UrqlProvider } from "urql";
import { ChildrenProps } from "./compoments/ChildrenProps";
import { HeaderContents } from "./compoments/layout/Header";
import { NavbarContents } from "./compoments/layout/Navbar";
import { SignInScreen } from "./features/auth/SignInScreen";
import { useRegisterUserMutation } from "./generated/graphql";
import { graphql } from "./generated/gql";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

const RegisterUserDocument = graphql(/* GraphQL */ `
  mutation registerUser {
    registerUser {
      id
    }
  }
`);

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
  const { loggedInUser } = Route.useLoaderData();

  const [_registerUserResult, registerUser] = useRegisterUserMutation();

  if (loggedInUser == null) {
    return (
      <Center>
        <Button
          onClick={async () => {
            await registerUser({});
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

const BranchingUrqlProvider =
  import.meta.env.VITE_DEMO_MODE === "true" ? DemoUrqlProvider : MyUrqlProvider;
const BranchingSignInCheck =
  import.meta.env.VITE_DEMO_MODE === "true" ? Fragment : SignInCheck;

const MainContent = memo(function MainContent(): React.JSX.Element {
  return (
    <BranchingSignInCheck>
      <BranchingUrqlProvider>
        <RegisterCheck>
          <Alert
            color="yellow"
            mb="md"
            style={{
              display:
                import.meta.env.VITE_DEMO_MODE === "true" ? undefined : "none",
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

const App: React.FC = () => {
  const [opened, handlers] = useDisclosure(false);

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <Notifications />
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
            <HeaderContents
              burgerOpened={opened}
              onBurgerClick={handlers.toggle}
            />
          </AppShell.Header>
          <AppShell.Navbar p="md">
            <NavbarContents />
          </AppShell.Navbar>
          <AppShell.Main>
            <MainContent />
          </AppShell.Main>
        </AppShell>
      </MantineProvider>
    </QueryClientProvider>
  );
};

export default App;
