import { h } from "preact";
import { route } from "preact-router";
import { useEffect, useRef, useState } from "preact/hooks";
import { useAppStore } from "@state/AppStore";
import { Footer } from "@components/Footer";
import { Header } from "@components/Header";
import { CheckIcon } from "@components/icons/Check";

export default function Language(_props: { path?: string }) {
  const nav = route;
  const {
    paymentPointer,
    locale,
    setLocale,
  } = useAppStore();
  const [focused, setFocused] = useState(0);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const availableLanguages = [
    { code: "en-US", label: "English" },
    { code: "es-ES", label: "Español" },
    { code: "ro-RO", label: "Română" },

  ];

  function handleLocaleChange(newLocale: string) {
    console.log("Changing locale to", newLocale);
    setLocale(newLocale);
    setTimeout(() => {
      window.location.reload();
    }, 200);
  }

  useEffect(() => {
    if (paymentPointer.length == 0) {
      nav("/setup");
    }
  }, []);
  useEffect(() => {
    btnRefs.current[focused]?.focus();
  }, [focused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const backKeys = ["SoftLeft", "EndCall"];
      if (e.key === "SoftLeft" || e.key === "Backspace") {
        nav("/settings");
        e.preventDefault();
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        setFocused((f) => (f + 1) % availableLanguages.length);
        e.preventDefault();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        setFocused((f) => (f - 1 + availableLanguages.length) % availableLanguages.length);
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nav, focused]);

  return (
    <section className="space-y-2">
      <Header />
      <div className="flex flex-col mt-4">
        {availableLanguages.map((lang, i) => (
          <button
            key={lang.code}
            ref={(el) => {
              btnRefs.current[i] = el;
            }}
            tabIndex={i === focused ? 0 : -1}
            onClick={() => handleLocaleChange(lang.code)}
            className={`bg-none bg-white py-3 text-left text-3xl menu-height border-none text-black ${i === focused ? "active-item-bg" : ""}`}
          >
            <div className="flex flex-row">
              <div className="flex flex-grow flex-col">
                <span data-l10n-id={`menu-${lang.code}`}></span>
                <span data-l10n-id={`menu-${lang.code}-hint`} className="text-xl"></span>
              </div>
              <div className="flex-none items-center">
                {locale === lang.code && <CheckIcon fill={`${i === focused ? "white" : "#007E50"}`} />}
              </div>
            </div>
          </button>
        ))}
      </div>
      <Footer optionBtn={false} />
    </section>
  );
}
