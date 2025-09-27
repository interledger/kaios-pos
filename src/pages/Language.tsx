import { h } from "preact";
import { route } from "preact-router";
import { useEffect, useRef, useState } from "preact/hooks";
import { useAppStore } from "@state/AppStore";
import { Footer } from "@components/Footer";
import { Header } from "@components/Header";

export default function Language(_props: { path?: string }) {
  const nav = route;
  const {
    paymentPointer,
    locale,
    setLocale,
  } = useAppStore();
  const [focused, setFocused] = useState(0);
  const inputRef = useRef<HTMLSelectElement>(null);

  const availableLanguages = [
    { code: "en-US", label: "English" },
    { code: "es-ES", label: "Español" },
    { code: "ro-RO", label: "Română" },

  ];

  function handleLocaleChange(e: Event) {
    const newLocale = (e.target as HTMLSelectElement).value;
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
    const handleKeyDown = (e: KeyboardEvent) => {
      const backKeys = ["SoftLeft", "EndCall"];
      if (e.key === "SoftLeft" || e.key === "Backspace") {
        nav("/settings");
        e.preventDefault();
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        setFocused((f) => (f + 1) % 2);
        e.preventDefault();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        setFocused((f) => (f - 1 + 2) % 2);
        e.preventDefault();
      } else if ((e.key === "Enter" || e.key === " ") && focused === 0) {
        // Open the select dropdown for locale selection
        inputRef.current?.focus();
        // Some browsers support showPicker for input, but not for select
        // For select, focus is the best we can do
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nav, focused]);

  return (
    <section className="space-y-2">
      <Header />
      <div className={`flex flex-col p-4 mt-4 ${0 === focused ? "active-item-bg" : ""}`}>
        <span data-l10n-id="app-language" className="text-2xl"></span>
        <div className="flex flex-row mt-2">
          <select
            ref={inputRef}
            value={locale}
            onChange={handleLocaleChange}
            className="p-2 rounded"
          >
            {availableLanguages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Footer optionBtn={false} />
    </section>
  );
}
