import { useAuth0 } from "@auth0/auth0-react";
import { Alert, AppShell, Button, Center, Loader } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Notifications } from "@mantine/notifications";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import React, { Fragment, memo } from "react";
import { ChildrenProps } from "../compoments/ChildrenProps";
import { HeaderContents } from "../compoments/layout/Header";
import { NavbarContents } from "../compoments/layout/Navbar";
import { isDemoMode } from "../config";
import { useLoggedInUser } from "../compoments/hooks/useLoggedInUser";
import { useRegisterUser } from "../compoments/hooks/useRegisterUser";
import { SignInScreen } from "../features/auth/SignInScreen";

export type RouterContext = {
  auth: {
    isAuthenticated: boolean;
  };
};

const SignInCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // AuthGate ensures Auth0 has finished loading before RouterProvider is mounted,
  // so isLoading check is not needed here.
  const { isAuthenticated } = useAuth0();

  if (isAuthenticated) {
    return <>{children}</>;
  }
  return <SignInScreen />;
};

const RegisterCheck: React.FC<ChildrenProps> = ({ children }) => {
  const { data, isLoading, error } = useLoggedInUser();
  const registerUserMutation = useRegisterUser();

  if (error != null) {
    return (
      <>
        <div>query error: {JSON.stringify(error)}</div>
      </>
    );
  }

  if (isLoading || data == null) {
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
          disabled={registerUserMutation.isPending}
          loading={registerUserMutation.isPending}
          onClick={async () => {
            if (registerUserMutation.isPending) return;
            await registerUserMutation.mutateAsync();
          }}
        >
          Register user
        </Button>
      </Center>
    );
  }

  return <>{children}</>;
};

const BranchingSignInCheck = isDemoMode ? Fragment : SignInCheck;

const MainContent = memo(function MainContent(): React.JSX.Element {
  return (
    <BranchingSignInCheck>
      <RegisterCheck>
        <Alert
          color="yellow"
          mb="md"
          style={{
            display: isDemoMode ? undefined : "none",
          }}
        >
          This is a demo app. Changes are temporary and will be lost on reload.
        </Alert>
        <Outlet />
      </RegisterCheck>
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
      {/* 
        Notifications is placed inside RouterProvider context so that
        components like LinkButton inside notifications can access router.
        App.tsx's MantineProvider is outside Auth0Provider/RouterProvider,
        so we place Notifications here to have both Mantine and Router context.
      */}
      <Notifications />
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
