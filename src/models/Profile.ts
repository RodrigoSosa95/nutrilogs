import mongoose from "mongoose";

export interface IProfileDocument extends mongoose.Document {
  names: string;
  lastNames: string;
  _pictures?: Array<mongoose.Types.ObjectId>;
  _user: mongoose.Types.ObjectId;
}

export interface IProfile extends IProfileDocument {}

export interface IProfileModel extends mongoose.Model<IProfile> {}

const profileSchema = new mongoose.Schema({
  names: {
    type: String,
    required: true,
  },
  lastNames: {
    type: String,
    required: true,
  },
  _pictures: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "ProfilePicture",
  },
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Profile: IProfileModel = mongoose.model("Profile", profileSchema);

export default Profile;
