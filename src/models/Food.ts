import mongoose from "mongoose";

export enum CURRENCIES {
  MXN = "MXN",
  USD = "USD",
}

export interface IFoodDocument extends mongoose.Document {
  name: string;
  type: string;
  cost: ICost;
  size: string;
  calories: number;
  meal: mongoose.Types.ObjectId;
}
export interface IFood extends IFoodDocument {}
export interface IFoodModel extends mongoose.Model<IFood> {}

export interface ICostDocument extends mongoose.Document {
  cost: number;
  currency: string;
}
export interface ICost extends ICostDocument {}
export interface ICostModel extends mongoose.Model<ICost> {}

const Cost = new mongoose.Schema({
  cost: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    enum: ["MXN", "USD"],
    required: true,
  },
});

const foodDocument = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    trim: true,
    enum: ["Beverage", "Aliment"],
  },
  cost: Cost,
  size: {
    type: String,
    trim: true,
  },
  calories: Number,
  meal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Meal",
  },
});

const Food: IFoodModel = mongoose.model("Food", foodDocument);

export default Food;
