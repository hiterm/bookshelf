import React from 'react';
import StyledFirebaseAuthOrigin from 'react-firebaseui/StyledFirebaseAuth';
import { firebase } from './Firebase';

function interopDefault<T>(value: T): T {
  return (value as any).default;
}

const StyledFirebaseAuth = interopDefault(StyledFirebaseAuthOrigin);

const uiConfig = {
  // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
  signInSuccessUrl: '/',
  // We will display Google and Facebook as auth providers.
  signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
};

export const SignInScreen: React.FC<{}> = () => {
  return (
    <div>
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
    </div>
  );
};
