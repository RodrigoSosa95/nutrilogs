import fs from "fs";
import { Response } from "express";
import { BAD_REQUEST } from "http-status-codes";

export const logErrorAndSendErrorResponse = (response: Response, error: Error, message: string) => {
  fs.writeFile("./errors.log", error.stack, (fsError: Error) => {
    console.log("New error written to logs file");
  });
  response.status(BAD_REQUEST).json({ message: "Could not create new meal", error: error.message }).send();
};
