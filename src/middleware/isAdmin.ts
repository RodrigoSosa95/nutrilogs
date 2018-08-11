import { Response, NextFunction } from "express";
import { UserRequest } from "./authenticate";
import { FORBIDDEN } from "../../node_modules/http-status-codes";

export default (
  request: UserRequest,
  response: Response,
  next: NextFunction,
): void => {
  const { isAdmin } = request.user;
  if (isAdmin) next();
  else response.status(FORBIDDEN).json({ message: "You do not have enough permissions" }).send();
};
