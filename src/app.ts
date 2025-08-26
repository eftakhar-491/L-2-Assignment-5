import express, { Request, Response } from "express";
export const app = express();
import { router } from "./app/routes";
import passport from "passport";
import cookieParser from "cookie-parser";
import cors from "cors";
import { envVars } from "./app/config/env";
import expressSession from "express-session";
import "./app/config/passport"; // Ensure passport is configured
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";

app.use(express.json());
app.use(
  expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: envVars.FRONTEND_URL,
    credentials: true,
  })
);
app.get("/", (req, res) => {
  res.send("Welcome to the APP, this is a ride sharing service");
});
app.use("/api/v1", router);

app.use(globalErrorHandler);
app.use(notFound);
