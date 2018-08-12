import { Request, Response, NextFunction } from "express";
import { UNAUTHORIZED, NOT_FOUND, FORBIDDEN } from "http-status-codes";
import User, { IUser } from "../models/User";

export interface UserRequest extends Request {
  user: IUser;
}

export default (
  request: UserRequest,
  response: Response,
  next: NextFunction
): void => {
  if (request.headers.authorization) {
    const token = request.headers.authorization.split(" ")[1];
    User.findByToken(token)
      .then((user: IUser) => {
        if (user.isActive) {
          user.populate("_profile", (error: Error, populatedUser) => {
            if (!error) {
              request.user = populatedUser;
              next();
            } else {
              response.status(NOT_FOUND).json({ message: "Error retrieving user data" }).send();
            }
          });
        } else {
          response.status(FORBIDDEN).json({ message: "Account deactivated" }).send();
        }
      })
      .catch((error: Error) => {
        response
          .status(NOT_FOUND)
          .json({ message: "Invalid token" })
          .send();
      });
  } else {
    response
      .status(UNAUTHORIZED)
      .json({ message: "Authentication token required" })
      .send();
  }
};
