import mongoose, { mongo } from "mongoose";

export enum TOKEN_TYPES {
  Auth = "authentication",
  PasswordReset = "password-reset",
}

export interface ITokenDocument extends mongoose.Document {
  key: string;
  type: string;
  _user: mongoose.Types.ObjectId;
}

export interface IToken extends ITokenDocument {}

export interface ITokenModel extends mongoose.Model<IToken> {}

const tokenSchema = new mongoose.Schema({
  key: {
    type: String,
    minLength: 10,
    required: true,
  },
  type: {
    type: String,
    enum: ["authentication", "password-reset"],
    required: true,
  },
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Token: ITokenModel = mongoose.model("Token", tokenSchema);

export default Token;
