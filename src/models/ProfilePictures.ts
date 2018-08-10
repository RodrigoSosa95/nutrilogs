import mongoose, { mongo } from "mongoose";
import { IProfileDocument } from "./Profile";

export interface IProfilePictureDocument extends mongoose.Document {
  uri: string;
  isActive: boolean;
  _owner: mongoose.Types.ObjectId;
}

export interface IProfile extends IProfileDocument {}

export interface IProfileModel extends mongoose.Model<IProfile> {}

const profilePictureSchema = new mongoose.Schema({
  uri: {
    type: String,
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

const ProfilePicture: IProfileModel = mongoose.model(
  "ProfilePicture",
  profilePictureSchema,
);

export default ProfilePicture;
