import { h } from "preact";

export default function Layout({
  children,
}: {
  children?: preact.ComponentChildren;
}) {
  return (
    <div className="min-h-screen w-full">
      <main className="mx-auto">{children}</main>
    </div>
  );
}
