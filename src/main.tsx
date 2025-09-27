import { h, render } from "preact";
import "kaios-gaia-l10n";
import "./index.scss";
import AppRouter from "@routes/router";
import { AppStoreProvider } from "@state/AppStore";
// Read persisted locale from localStorage (default to en-US)
let locale = "en-US";
try {
  const raw = localStorage.getItem("ilfpos");
  if (raw) {
    const parsed = JSON.parse(raw);
    if (parsed.locale) locale = parsed.locale;
  }
} catch (e) {
  // ignore
}
// Set custom locale using global API
if (window.navigator && window.navigator.mozL10n) {
  console.log("Setting locale to", locale);
  //window.navigator.mozL10n.language.code = locale;
  window.navigator.mozL10n.ctx.ready(() => {
    window.navigator.mozL10n.ctx.requestLocales(locale);
  });
}

render(
  <AppStoreProvider>
    <AppRouter />
  </AppStoreProvider>,
  document.getElementById("root")!
);
