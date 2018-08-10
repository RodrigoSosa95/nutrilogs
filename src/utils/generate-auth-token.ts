import jsonwebtoken from "jsonwebtoken";
import mongoose from "mongoose";

export default (email: string, _id: mongoose.Types.ObjectId): string => {
  const token = jsonwebtoken.sign(
    {
      email,
      _id,
    },
    "g=6dV$X)vJk?tu)rq.", // TODO: move this to ENV variables
    { expiresIn: "30d" },
  );

  return token;
};
