import express from "express";
import userController from "./userControllers";
import mealController from "./mealControllers";

const router = express.Router();

router.use("/users/", userController);
router.use("/meals/", mealController);

export default router;
