import mongoose, { mongo } from "mongoose";
import { IProfileDocument } from "./Profile";

export interface IProfilePictureDocument extends mongoose.Document {
  uri: string;
  isActive: boolean;
  _owner: mongoose.Types.ObjectId;
}

export interface IProfilePicture extends IProfileDocument {}

export interface IProfilePictureModel extends mongoose.Model<IProfilePicture> {}

const profilePictureSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  _owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
});

const ProfilePicture: IProfilePictureModel = mongoose.model(
  "ProfilePicture",
  profilePictureSchema,
);

export default ProfilePicture;
