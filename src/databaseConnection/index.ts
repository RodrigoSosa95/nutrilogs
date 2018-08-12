import mongoose from "mongoose";

export default (uri: string, settings: object): void => {
  mongoose.connect(
    uri,
    settings,
    (error: Error) => {
      if (error) {
        console.log("Error connecting to mongo database");
      }
      console.log("Connected to database");
    },
  );
};
