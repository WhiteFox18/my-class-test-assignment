import { Router } from "express";
import LessonsController from "../../controllers/LessonsController";
import { validate } from "../../modules/middlewares";
import { body, query } from "express-validator";
import moment from "moment";

const router = Router();

router
  .get("/",
    validate([
      query("status").isNumeric().custom((value) => value == 0 || value == 1),
      query("date").custom((value) => {
        let array = value.split(",");

        if(array.length === 1 && moment(array[0], "YYYY-MM-DD", true).isValid())
          return true

        if (
          array.length > 3 ||
          !moment(array[0], "YYYY-MM-DD", true).isValid() ||
          !moment(array[1], "YYYY-MM-DD", true).isValid()
        )
          return false;

        return true;
      }),
      query("teacherIds").isString()
        .custom((value) => value.split(",").every((element: string) => Number.isInteger(Number(element)))),
      query("studentsCount").isString().custom((value) => {
        let array = value.split(",");

        if(array.length === 1 && Number.isInteger(Number(array[0])))
          return true

        if (array.length > 3 || !Number.isInteger(Number(array[0])) || !Number.isInteger(Number(array[1])))
          return false;

        return true;
      }),
      query("lessonsPerPage").isNumeric(),
      query("page").isNumeric(),
    ]),
    LessonsController.listLessons)

  .post("/",
    validate([
      body("teacherIds").isArray().custom((value) => value.every((num: number) => Number.isInteger(num))),
      body("title").trim().isString().isLength({ min: 1 }),
      body("days").isArray().custom((value) => value.every((num: number) => Number.isInteger(num))),
      body("firstDate").isDate({format: "YYYY-MM-DD"}),
      body("lessonsCount").isNumeric().isLength({ max: 300 }),
      body("lastDate").isDate({format: "YYYY-MM-DD"}).custom((value, {req}) => {
        const date1 = new Date(req.body.firstDate);
        const date2 = new Date(value);
        const diff_time = date2.getTime() - date1.getTime();
        const diff_days = Math.ceil(diff_time / (1000 * 60 * 60 * 24));

        return diff_days < 365
      }),
    ]),
    LessonsController.createLesson);

export default router;