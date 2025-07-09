import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { RouterProvider } from '@tanstack/react-router';
import { router } from './routes';
import "./index.css";

const container = document.getElementById("root");
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
