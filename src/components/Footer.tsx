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
      {backBtn && <div id="softkey-left" className="px-4">Back</div>}
      {!backBtn && <div className="w-15" />}
      {selectBtn && <div id="softkey-center">SELECT</div>}
      {!selectBtn && <div className="w-15" />}
      {optionBtn && <div id="softkey-right" className="px-4" onClick={() => route("/settings")}>Settings</div>}
      {!optionBtn && <div className="w-15" />}
    </footer>
  );
}
