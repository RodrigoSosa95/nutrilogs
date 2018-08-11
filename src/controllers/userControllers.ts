import express, { Request, Response, NextFunction } from "express";
import { BAD_REQUEST, OK, NOT_FOUND } from "http-status-codes";
import User, { IUser } from "../models/User";
import authenticate, { UserRequest } from "../middleware/authenticate";
import { IToken } from "../models/Token";
import isAdmin from "../middleware/isAdmin";
import Profile from "../models/Profile";
import { IProfile } from "../models/ProfilePictures";
import { NOTFOUND } from "dns";

const router = express.Router();

router.post(
  "/create-user/",
  authenticate,
  isAdmin,
  (
    { body: { email, password, profile } }: Request,
    response: Response
  ): void => {
    const _ = User.createUser({ email, password });
    _.save()
      .then((user: IUser) => {
        return user;
      })
      .then((user: IUser) => {
        const _ = new Profile(profile);
        return _.save()
          .then((profile: IProfile) => {
            user._profile = profile._id;
            return user.save();
          })
          .catch((error: Error) => {
            response
              .status(BAD_REQUEST)
              .json({ message: "Unable to create user", error: error.message })
              .send();
          });
      })
      .then((_: IUser) => {
        _.populate("_profile", (error: Error, user: IUser) => {
          if (!error) {
            response
              .status(OK)
              .json({ user })
              .send();
          } else {
            response
              .status(BAD_REQUEST)
              .json({ message: "Unable to create user", error: error.message })
              .send();
          }
        });
      })
      .catch((error: Error) => {
        response
          .status(BAD_REQUEST)
          .json({ message: "Unable to create user", error: error.message })
          .send();
      });
  }
);

router.post(
  "/create-admin-user/",
  authenticate,
  isAdmin,
  ({ body: { email, password, profile } }, response: Response): void => {
    const _ = User.createAdminUser({ email, password });
    _.save()
      .then((user: IUser) => {
        return user;
      })
      .then((user: IUser) => {
        const _ = new Profile(profile);
        return _.save()
          .then((profile: IProfile) => {
            user._profile = profile._id;
            return user.save();
          })
          .catch((error: Error) => {
            response
              .status(BAD_REQUEST)
              .json({
                message: "Unable to create admin user",
                error: error.message
              })
              .send();
          });
      })
      .then((_: IUser) => {
        _.populate("_profile", (error: Error, user: IUser) => {
          if (!error) {
            response
              .status(OK)
              .json({ user })
              .send();
          } else {
            response
              .status(BAD_REQUEST)
              .json({
                message: "Unable to create admin user",
                error: error.message
              })
              .send();
          }
        });
      })
      .catch((error: Error) => {
        response
          .status(BAD_REQUEST)
          .json({
            message: "Unable to create admin user",
            error: error.message
          })
          .send();
      });
  }
);

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
  }
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
  }
);

router.get(
  "/current-user/",
  authenticate,
  (request: UserRequest, response: Response): void => {
    response
      .status(OK)
      .json({ user: request.user })
      .send();
  }
);

router.get(
  "/all/",
  authenticate,
  isAdmin,
  (request: UserRequest, response: Response): void => {
    User.find()
      .then(users => {
        response
          .status(OK)
          .json({ users })
          .send();
      })
      .catch((error: Error) => {
        response.status(BAD_REQUEST).json({
          message: "Unable to complete request",
          error: error.message
        });
      });
  }
);

router.get(
  "/:objectId/",
  authenticate,
  (request: UserRequest, response: Response): void => {
    const { objectId } = request.params;
    User.findOne({ _id: objectId })
      .then(user => {
        response
          .status(OK)
          .json({ user })
          .send();
      })
      .catch((error: Error) => {
        response
          .status(NOT_FOUND)
          .json({ message: "Could not complete request", error: error.message })
          .send();
      });
  }
);



export default router;
