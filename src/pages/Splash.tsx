import { useEffect } from "preact/hooks";
import { route } from "preact-router";
export default function Splash(_props: { path?: string }) {
  const nav = route;
  useEffect(() => {
    const id = setTimeout(() => nav("/setup"), 5900);
    return () => clearTimeout(id);
  }, [nav]);
  return (
    <div className="h-90vh grid place-items-center">
      <div className="text-center">
        <div className="mt-12 pt-8 pb-8">
          <img src="/assets/icons/logo.png" alt="Interledger POS" className="mx-auto" />
        </div>
        <div className="text-4xl font-extrabold text-black mt-6">
          Interledger POS
        </div>
      </div>
    </div>
  );
}
