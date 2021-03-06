import path from "path";
import express from "express";
import bodyParser from "body-parser";
import databaseConnection from "./databaseConnection";
import rootControllers from "./controllers";

const databaseUri: string =
  process.env.DB_URI || "mongodb://localhost:27017/nutrilogs";

databaseConnection(databaseUri, {
  useNewUrlParser: true
});

const app = express();

app.set("port", process.env.PORT || 3005);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("../media"));

app.use("/api/v1/", rootControllers);

app.listen(app.get("port"), () => {
  console.log(
    `Application started on port ${app.get("port")}\nUse CTRL-C to stop\n`
  );
});

export default app;
