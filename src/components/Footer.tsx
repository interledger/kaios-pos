import { h } from "preact";
import { route } from "preact-router";

type FooterProps = {
  path?: string;
  backBtn?: boolean;
  selectBtn?: boolean;
  optionBtn?: boolean;
};

export function Footer({
  path = "",
  backBtn = true,
  selectBtn = true,
  optionBtn = true,
}: FooterProps) {

  return (
    <footer className="flex bg-white-90 items-center justify-between w-full fixed b text-3xl">
      {backBtn && <div data-l10n-id="back" id="softkey-left" className="px-4"></div>}
      {!backBtn && <div className="w-15" />}
      {selectBtn && <div data-l10n-id="select" id="softkey-center" className="uppercase"></div>}
      {!selectBtn && <div className="w-15" />}
      {optionBtn && <div data-l10n-id="settings" id="softkey-right" className="px-4" onClick={() => route("/settings")}></div>}
      {!optionBtn && <div className="w-15" />}
    </footer>
  );
}
