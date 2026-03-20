import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { prepare } from "./prepare";
import "./index.css";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById("root")!);

function renderApp() {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

prepare()
  .then(renderApp)
  .catch((err: unknown) => {
    console.error("Failed to start MSW:", err);
    renderApp();
  });
