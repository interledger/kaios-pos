import React, { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "@components/Layout";
import { ErrorBoundary } from "@components/ErrorBoundary";
const Splash = lazy(() => import("@pages/Splash"));
const Setup = lazy(() => import("@pages/Setup"));
const Menu = lazy(() => import("@pages/Menu"));
const Sell = lazy(() => import("@pages/Sell"));
const WaitCard = lazy(() => import("@pages/WaitCard"));
const Balance = lazy(() => import("@pages/Balance"));
const EndOfDay = lazy(() => import("@pages/EndOfDay"));
const Settings = lazy(() => import("@pages/Settings"));
const Loader = <div className="p-6 text-center text-white/70">Loading…</div>;
export const router = createBrowserRouter([
  {
    element: (
      <ErrorBoundary>
        <Layout />
      </ErrorBoundary>
    ),
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={Loader}>
            <Splash />
          </Suspense>
        ),
      },
      {
        path: "/setup",
        element: (
          <Suspense fallback={Loader}>
            <Setup />
          </Suspense>
        ),
      },
      {
        path: "/menu",
        element: (
          <Suspense fallback={Loader}>
            <Menu />
          </Suspense>
        ),
      },
      {
        path: "/sell",
        element: (
          <Suspense fallback={Loader}>
            <Sell />
          </Suspense>
        ),
      },
      {
        path: "/wait-card",
        element: (
          <Suspense fallback={Loader}>
            <WaitCard />
          </Suspense>
        ),
      },
      {
        path: "/balance",
        element: (
          <Suspense fallback={Loader}>
            <Balance />
          </Suspense>
        ),
      },
      {
        path: "/eod",
        element: (
          <Suspense fallback={Loader}>
            <EndOfDay />
          </Suspense>
        ),
      },
      {
        path: "/settings",
        element: (
          <Suspense fallback={Loader}>
            <Settings />
          </Suspense>
        ),
      },
    ],
  },
]);
