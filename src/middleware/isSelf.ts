import { Response, NextFunction } from "express";
import { UserRequest } from "./authenticate";
import { FORBIDDEN } from "http-status-codes";

export default (
  request: UserRequest,
  response: Response,
  next: NextFunction,
) => {
  const { objectId }: { objectId: string } = request.params;
  if (objectId === request.user._id) {
    next();
  } else {
    response.status(FORBIDDEN).json({ message: "Can't update another user's data" }).send();
  }
};
