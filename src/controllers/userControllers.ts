import express, { Request, Response, NextFunction } from "express";
import { BAD_REQUEST, OK, NOT_FOUND } from "http-status-codes";
import fs from "fs";
import multer = require("multer");
import moment from "moment";
import User, { IUser } from "../models/User";
import authenticate, { UserRequest } from "../middleware/authenticate";
import { IToken } from "../models/Token";
import isAdmin from "../middleware/isAdmin";
import Profile, { IProfile } from "../models/Profile";
import ProfilePicture, { IProfilePicture } from "../models/ProfilePictures";
import isSelf from "../middleware/isSelf";

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

enum FILE_TYPES {
  JPG = "image/jpeg",
  PNG = "image/png",
  TIF = "image/tiff"
}
const profilePictureUploader = multer({
  limits: { fileSize: 3460300.0, files: 3, parts: 10 },
  storage: multer.diskStorage({
    destination(request: UserRequest, file, next) {
      next(undefined, "./media/profile-pictures/");
    },
    filename(request: UserRequest, file, next) {
      const { user }: { user: IUser } = request;
      const date = moment().unix();
      let fileExtension = undefined;
      switch (file.mimetype) {
        case FILE_TYPES.JPG:
          fileExtension = "jpg";
          break;
        case FILE_TYPES.PNG:
          fileExtension = "png";
          break;
        case FILE_TYPES.TIF:
          fileExtension = "tif";
          break;
        default:
          fileExtension = "";
          break;
      }
      next(
        undefined,
        `${file.fieldname}-${
          request.user._id
        }-${date.toString()}.${fileExtension}`
      );
    }
  }),
  fileFilter(request: UserRequest, file, next) {
    if (
      file.mimetype === FILE_TYPES.JPG ||
      file.mimetype === FILE_TYPES.PNG ||
      file.mimetype === FILE_TYPES.TIF
    ) {
      next(undefined, true);
    } else {
      next(undefined, false);
    }
  }
});

router.put(
  "/update-user/",
  authenticate,
  profilePictureUploader.single("profile-image"),
  (request: UserRequest, response: Response): void => {
    const { user: _ } = request;
    const { names, lastNames } = request.body;
    Profile.findOne({ _id: _._profile })
      .then((profile: IProfile) => {
        profile.names = names || profile.names;
        profile.lastNames = lastNames || profile.lastNames;
        return profile.save();
      })
      .then((profile: IProfile) => {
        const profilePicture = new ProfilePicture({
          destination: request.file.destination,
          path: request.file.path,
          fileName: request.file.filename,
          size: request.file.size,
          _owner: _._id
        });
        profilePicture.save(
          (error: Error, savedProfilePicture: IProfilePicture) => {
            if (!error) {
              profile._pictures.push(savedProfilePicture._id);
              return profile.save();
            } else {
              response
                .status(BAD_REQUEST)
                .json({
                  message: "Error uploading profile user picture",
                  error: error.message
                })
                .send();
            }
          }
        );
      })
      .then(() => {
        _.populate("_profile", (error: Error, user) => {
          response
            .status(OK)
            .json({ user })
            .send();
        });
      })
      .catch((error: Error) => {
        response
          .status(BAD_REQUEST)
          .json({ message: "Error updating user", error: error.message });
      });
  }
);

router.delete(
  "/deactivate-account/",
  authenticate,
  (request: UserRequest, response: Response): void => {
    const { user } = request;
    user.isActive = false;
    user
      .save()
      .then(() => {
        response
          .status(OK)
          .json({ message: "You've deactivated your account successfully" });
      })
      .catch((error: Error) => {
        response.status(BAD_REQUEST).json({
          message: "Error deactivating your account",
          error: error.message
        });
      });
  }
);

router.put(
  "/update-email/",
  authenticate,
  (request: UserRequest, response: Response): void => {
    const { user } = request;
    const { email } = request.body;
    user.email = email;
    user
      .save(() => {
        // TODO: send email when this action happens
        response.status(OK).json({ message: "User email updated", user });
      })
      .catch((error: Error) => {
        response
          .status(BAD_REQUEST)
          .json({
            message: "Could not update user email",
            error: error.message
          });
      });
  }
);



export default router;
