import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { isDemoMode } from "./config";
import "./index.css";

async function main() {
  if (isDemoMode) {
    const { worker } = await import("./mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const root = createRoot(document.getElementById("root")!);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

void main();
