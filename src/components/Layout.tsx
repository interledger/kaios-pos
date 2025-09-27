import { h } from "preact";
//import { Header } from "@components/Header";
// import { getLocation } from "@lib/hashHistory";
// import Splash from "@pages/Splash";
export default function Layout({ children }: { children?: preact.ComponentChildren }) {

  // const location = getLocation();
  // console.log("Layout", location);
  // const isSplash = location.pathname === "/" || location.pathname === "/setup";

  // console.log("isSplash", isSplash);
  return (
    <div className="min-h-screen w-full">
      {/* <Header /> */}
      <main className="mx-auto">{children}</main>

    </div>
  );
}
