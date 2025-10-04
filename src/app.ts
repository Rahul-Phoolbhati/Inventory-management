import express from "express";
import morgan from "morgan";
import cors from "cors";
import productsRouter from "./routes/products";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/products", productsRouter);

app.use(errorHandler);

export default app;
