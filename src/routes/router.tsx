import { h } from "preact";
import Router from "preact-router";
import hashHistory from "@lib/hashHistory";
import Layout from "@components/Layout";
import Splash from "@pages/Splash";
import Setup from "@pages/Setup";
import Menu from "@pages/Menu";
import Sell from "@pages/Sell";
import WaitCard from "@pages/WaitCard";
import Balance from "@pages/Balance";
import EndOfDay from "@pages/EndOfDay";
import Settings from "@pages/Settings";

export default function AppRouter() {
  return (
    <Layout>
      <Router history={hashHistory}>
        <Splash path="/" />
        <Setup path="/setup" />
        <Menu path="/menu" />
        <Sell path="/sell" />
        <WaitCard path="/wait-card" />
        <Balance path="/balance" />
        <EndOfDay path="/eod" />
        <Settings path="/settings" />
      </Router>
    </Layout>
  );
}
