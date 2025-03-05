import { Hono } from "hono";
import { routes } from "./routes";

const app = new Hono();

app.route("/v1.0.0.beta.1", routes);

export default app;
