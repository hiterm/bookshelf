import { useAuth0 } from "@auth0/auth0-react";
import { Button, Center } from "@mantine/core";
import React from "react";

export const SignInScreen: React.FC = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <Center>
      <Button
        onClick={() => {
          loginWithRedirect();
        }}
      >
        Login
      </Button>
    </Center>
  );
};
