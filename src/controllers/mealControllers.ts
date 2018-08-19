import fs from "fs";
import express, { Response } from "express";
import authenticate, { UserRequest } from "../middleware/authenticate";
import Food, { IFood } from "../models/Food";
import Meal, { IMeal } from "../models/Meal";
import { OK, BAD_REQUEST } from "http-status-codes";
import { logErrorAndSendErrorResponse } from "../utils/error-handlers";

const router = express.Router();

router.post("/new-meal/", authenticate, (request: UserRequest, response: Response) => {
  const { items, total, location, date }: {items: [IFood], total: number, location: string, date: Date} = request.body;
  const meal: IMeal = new Meal({total, location, date, _user: request.user._id});
  Food.insertMany(items).then((savedItems) => {
    const itemObjectIds = savedItems.map((item) => {
      return item._id;
    });
    meal.items = itemObjectIds;
    return meal.save();
  }).then(() => {
    response.status(OK).json({ meal }).send();
  }).catch((error: Error) => {
    fs.writeFile("./errors.log", error.stack, (fsError: Error) => {
      console.log("New error written to logs file");
    });
    response.status(BAD_REQUEST).json({ message: "Could not create new meal", error: error.message }).send();
  });
});

router.put("/update-meal/:objectId", authenticate, (request: UserRequest, response: Response) => {
  const { objectId: mealId }: { objectId: string } = request.params.objectId;
  Meal.findById(mealId).then((meal: IMeal) => {
    meal.total = request.body.total || meal.total;
    meal.location = request.body.location || meal.location;
    meal.date = request.body.date || meal.date;
    meal.items = [
      ...meal.items,
      ...request.body.items,
    ];

    return meal.save();
  })
  .then((updatedMeal: IMeal) => {
    response.status(OK).json({ message: "Meal updated", object: updatedMeal }).send();
  })
  .catch((error: Error) => {
    logErrorAndSendErrorResponse(response, error, "Could not update meal, please try again");
  });
});

router.put("/remove-meal/:objectId", authenticate, (request: UserRequest, response: Response) => {
  
});

router.put("/my-meals/", authenticate, (request: UserRequest, response: Response) => {
  
});

router.put("/meal/:objectId", authenticate, (request: UserRequest, response: Response) => {
  
});
