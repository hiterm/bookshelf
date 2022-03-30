import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import { StyledFirebaseAuth } from 'react-firebaseui';
import { firebase } from './Firebase';

const uiConfig = {
  // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
  signInSuccessUrl: '/',
  // We will display Google and Facebook as auth providers.
  signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
};

export const SignInScreen: React.FC<{}> = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div>
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
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
