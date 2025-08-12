import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "@components/Header";
export default function Layout() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <Header />
      <main className="mx-auto max-w-md p-4">
        <Outlet />
      </main>
    </div>
  );
}
