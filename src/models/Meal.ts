import mongoose from "mongoose";
import Food, { IFood } from "./Food";

export interface IMealDocument extends mongoose.Document {
  items: Array<IFood>;
  total: number;
  location: string;
  date: Date;
  _user: mongoose.Types.ObjectId;
}

export interface IMeal extends IMealDocument {}

export interface IMealModel extends mongoose.Model<IMeal> {}

const mealSchema = new mongoose.Schema({
  items: {
    type: [mongoose.Types.ObjectId],
    ref: "Food"
  },
  total: {
    type: Number,
  },
  location: {
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

const Meal: IMealModel = mongoose.model("Meal", mealSchema);

export default Meal;
