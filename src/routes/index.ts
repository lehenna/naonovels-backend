import { Hono } from "hono";
import { AuthRoutes } from "./auth";
import { UserRoutes } from "./users";
import { SessionRoutes } from "./sessions";
import { SerieRoutes } from "./series";
import { VolumeRoutes } from "./volumes";
import { ChapterRoutes } from "./chapters";
import { ChapterPostRoutes } from "./chapter-posts";

const routes = new Hono();

routes.route("/auth", AuthRoutes);
routes.route("/users", UserRoutes);
routes.route("/sessions", SessionRoutes);
routes.route("/teams", SessionRoutes);
routes.route("/series", SerieRoutes);
routes.route("/volumes", VolumeRoutes);
routes.route("/chapter-posts", ChapterPostRoutes);
routes.route("/chapters", ChapterRoutes);

export { routes };
