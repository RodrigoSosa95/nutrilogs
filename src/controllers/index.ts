import express from "express";
import usersController from "./userControllers";

const router = express.Router();

router.use("/users/", usersController);

export default router;
