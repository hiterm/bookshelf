import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { Center, Loader } from "@mantine/core";
import { RouterProvider } from "@tanstack/react-router";
import React from "react";
import { isDemoMode } from "./config";
import { router } from "./router";

/**
 * Auth0 の初期化が完了してから RouterProvider を mount することで、
 * beforeLoad が /?code=...&state=... のコールバック URL で発火する前に
 * Auth0 SDK が handleRedirectCallback() を完了することを保証する。
 * https://github.com/TanStack/router/discussions/1322
 *
 * DEMO モード時は Auth0 の設定が空なので checkSession() がエラーになるが、
 * その場合も isLoading が false になった時点で RouterProvider をマウントする。
 * BranchingSignInCheck が Fragment に差し替えられるため認証チェックはスキップされる。
 */
function AuthGate() {
  const auth = useAuth0();
  // DEMO モード時は Auth0 初期化エラーになっても RouterProvider をマウントする
  if (auth.isLoading && !isDemoMode) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader />
      </Center>
    );
  }
  return <RouterProvider router={router} context={{ auth }} />;
}

export const AppRoot: React.FC = () => {
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        redirect_uri: window.location.origin,
      }}
    >
      <AuthGate />
    </Auth0Provider>
  );
};
