import { Footer } from "@components/Footer";
import { Header } from "@components/Header";
import { PinComponent } from "@components/PinComponent";

export default function Pin(_props: { path?: string }) {
  return (
    <section className="space-y-4">
      <Header title="enter-pin" />
      <PinComponent />
      <Footer optionBtn={false} />
    </section>
  );
}