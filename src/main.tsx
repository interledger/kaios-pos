import { h, render } from "preact";
import "kaios-gaia-l10n";
import "./index.scss";
import AppRouter from "@routes/router";
import { AppStoreProvider } from "@state/AppStore";

render(
  <AppStoreProvider>
    <AppRouter />
  </AppStoreProvider>,
  document.getElementById("root")!
);
