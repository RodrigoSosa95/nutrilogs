import mongoose from "mongoose";
import Food from "./Food";

export interface IMealDocument extends mongoose.Document {
  items: Array<any>;
  total: number;
  where: string;
  date: Date;
  _user: mongoose.Types.ObjectId;
}

const Meal = new mongoose.Schema({
  items: [Food],
  total: {
    type: Number,
  },
  where: {
    type: String,
    trim: true,
    minLength: 5,
  },
  date: {
    type: Date,
    default: new Date(),
  },
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

export default mongoose.model("meal", Meal);
