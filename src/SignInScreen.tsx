import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';

export const SignInScreen: React.FC<{}> = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div>
      <button
        onClick={() => {
          loginWithRedirect();
        }}
      >
        Login
      </button>
    </div>
  );
};
