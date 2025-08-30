import { h, render } from "preact";
import "./index.css";
import AppRouter from "@routes/router";
import { AppStoreProvider } from "@state/AppStore";

render(
  <AppStoreProvider>
    <AppRouter />
  </AppStoreProvider>,
  document.getElementById("root")!
);
