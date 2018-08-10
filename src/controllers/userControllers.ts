import express, { Request, Response, NextFunction } from "express";
import { BAD_REQUEST, OK, NOT_FOUND } from "http-status-codes";
import User, { IUser } from "../models/User";
import authenticate, { UserRequest } from "../middleware/authenticate";
import { IToken } from "../models/Token";

const router = express.Router();

router.post(
  "/sign-up/",
  (request: Request, response: Response): void => {
    const { email, password, profile } = request.body;
    User.signUp(email, password, profile)
      .then((user: IUser) => {
        response.json({ user }).send();
      })
      .catch((error: Error) => {
        response
          .status(BAD_REQUEST)
          .json({ message: "Unable to sign user up", error: error.message })
          .send();
      });
  },
);

router.post(
  "/sign-in/",
  (request: Request, response: Response): void => {
    const { email, password } = request.body;
    User.signIn(email, password)
      .then((token: IToken) => {
        response
          .status(OK)
          .json({ token })
          .send();
      })
      .catch((error: Error) => {
        response
          .status(BAD_REQUEST)
          .json({ message: "Unable to authenticate", error: error.message })
          .send();
      });
  },
);

router.get(
  "/users/",
  authenticate,
  (request: UserRequest, response: Response): void => {
    console.log(request.user);
    User.find()
      .select("-password")
      .then((users: IUser[]) => {
        response.json({ users }).send();
      })
      .catch((error: Error) => {
        response
          .status(NOT_FOUND)
          .json({ message: "Unable to complete request", error: error.message })
          .send();
      });
  },
);

export default router;
