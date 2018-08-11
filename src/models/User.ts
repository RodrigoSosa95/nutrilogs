import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import generateAuthToken from "../utils/generate-auth-token";
import Token, { TOKEN_TYPES, IToken, ITokenModel } from "./Token";
import Profile, { IProfileDocument, IProfileModel, IProfile } from "./Profile";
import { resolve } from "url";

export interface IUserDocument extends mongoose.Document {
  email: string;
  password: string;
  _profile: mongoose.Types.ObjectId;
  isActive?: boolean;
  isAdmin?: boolean;
}

export interface IUser extends IUserDocument {
  updateOrCreateToken(): Promise<any>;
}

export interface IUserModel extends mongoose.Model<IUser> {
  signUp(
    email: string,
    password: string,
    profile: IProfileDocument,
  ): Promise<any>;
  signIn(email: string, password: string): Promise<any>;
  findByToken(key: string): Promise<any>;
  createUser(data: Object): IUser;
  createAdminUser(data: Object): IUser;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    validate: {
      validator: (value: string) => validator.isEmail(value),
      message: "{VALUE} is not a valid email address",
    },
    required: true,
    unique: true,
  },
  password: {
    type: String,
    minLength: 8,
    required: true,
  },
  _profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const hashPassword = (password: string) =>
  new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (hashError, hash) => {
      if (hashError) reject(hashError);
      resolve(hash);
    });
  });

userSchema.statics.signUp = function signUp(
  email: string,
  password: string,
  profile: IProfileDocument,
) {
  const User = this;
  return new Promise((resolve, reject) => {
    hashPassword(password)
      .then((hashedPassword: string) => {
        const user: IUser = new User({ email, password: hashedPassword });
        return user.save();
      })
      .then((savedUser: IUser) => {
        const userProfile: IProfile = new Profile({
          names: profile.names,
          lastNames: profile.lastNames,
          user: savedUser._id,
        });
        userProfile.save().then(profile => {
          savedUser._profile = profile._id;
          savedUser.save().then(() => {
            resolve(savedUser);
          });
        });
      })
      .catch((error: Error) => {
        reject(error);
      });
  });
};

const comparePasswords = (inputPassword: string, userInstance: IUser) =>
  new Promise((resolve, reject) => {
    bcrypt.compare(
      inputPassword,
      userInstance.password,
      (comparisonError: Error, result: boolean) => {
        if (comparisonError) reject(comparisonError);
        if (result) resolve(userInstance);
        reject(new Error("Unauthorized"));
      },
    );
  });

userSchema.methods.updateOrCreateToken = function updateOrCreateToken() {
  const user: IUser = this;
  return new Promise((resolve, reject) => {
    Token.findOne({ type: TOKEN_TYPES.Auth }, (error: Error, token: IToken) => {
      const key = generateAuthToken(user.email, user._id);
      if (error) reject(error);
      if (token) {
        token.key = key;
        token.save().then(() => {
          resolve(token);
        });
      } else {
        const newToken: IToken = new Token({
          key,
          type: TOKEN_TYPES.Auth,
          _user: user._id,
        });
        newToken.save().then((savedNewToken) => {
          resolve(savedNewToken);
        });
      }
    });
  });
};

userSchema.statics.signIn = function signIn(email: string, password: string) {
  const User: IUserModel = this;
  return new Promise((resolve, reject) => {
    User.findOne({ email })
    .then(user => comparePasswords(password, user))
    .then((verifiedUserAccount: IUser) => {
      verifiedUserAccount.updateOrCreateToken().then((token) => {
        resolve(token.key);
      });
    })
    .catch((error: Error) => {
      reject(error);
    });
  });
};

userSchema.statics.findByToken = function findByToken(key: string) {
  const User: IUserModel = this;
  return new Promise((resolve, reject) => {
    Token.findOne({ key, type: TOKEN_TYPES.Auth })
      .then((token: IToken) => {
        if (token) {
          return User.findOne({ _id: token._user });
        } else {
          reject(new Error("Invalid token"));
        }
      })
      .then((user: IUser) => {
        resolve(user);
      })
      .catch((error: Error) => {
        reject(error);
      });
  });
};

userSchema.statics.createUser = function createUser(data: Object) {
  const User = this;
  const user = new User(data);
  return user;
};

userSchema.statics.createAdminUser = function createAdminUser(data: Object) {
  const User = this;
  const user = User.createUser(data);
  user.isAdmin = true;
  return user;
};

const User: IUserModel = mongoose.model<IUser, IUserModel>("User", userSchema);

export default User;
