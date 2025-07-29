import express, { Request, Response } from "express";
export const app = express();
import { router } from "./app/routes";

app.use(express.json());

app.use("/api/v1", router);
