import { h } from "preact";
import { render } from "preact";
import "./index.css";
import AppRouter from "@routes/router";
render(<AppRouter />, document.getElementById("root")!);
