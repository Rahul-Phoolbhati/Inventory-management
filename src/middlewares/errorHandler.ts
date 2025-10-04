import { NextFunction, Request, Response } from "express";
import { ApiError } from "../types";
import { ZodError } from "zod";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }


  if (err instanceof ZodError) {
    console.log("printing the error")
    console.log(err)
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
        details: err.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }

  console.error(err);
  return res.status(500).json({ error: { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong." } });
}
