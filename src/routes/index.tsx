import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: RootComponent,
});

function RootComponent() {
  // To avoid auth0 issue
  // https://github.com/TanStack/router/discussions/1322
  const navigate = useNavigate();
  const search = new URLSearchParams(window.location.search);
  const hasAuthCallback = search.has("code") && search.has("state");

  // hasAuthCallback と navigate は初回レンダリング時の値のみ参照すればよいため deps は空
  useEffect(() => {
    // Auth0 コールバック中 (/?code=...&state=...) はリダイレクトしない
    // Auth0 SDK が handleRedirectCallback() を呼び、onRedirectCallback で /books に遷移する
    if (!hasAuthCallback) {
      void navigate({ to: "/books" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <div />;
}
