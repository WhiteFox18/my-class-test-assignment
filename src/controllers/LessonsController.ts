import { NextFunction, Request, Response } from "express";
import db from "../db";
import { getOffset } from "../modules/helpers";

const LessonsController = {
  listLessons: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const student_count: number[] = (req.query.studentsCount as string).split(",") as any as number[];
      const lesson_dates: string[] = (req.query.date as string).split(",");
      const teacher_ids: number[] = (req.query.teacherIds as string).split(",") as any as number[];
      const lesson_status: number = req.query.status as any as number;

      const limit = req.query.lessonsPerPage as any as number;
      const offset = getOffset({
        limit: limit,
        page: req.query.page as any as number,
      });

      res.json(
        await db.lessons.service.listLessons({
          student_count_first_number: student_count[0],
          student_count_second_number: student_count[1],
          lesson_first_date: lesson_dates[0] as any as Date,
          lesson_second_date: lesson_dates[1] as any as Date,
          teacher_ids: teacher_ids,
          lesson_status: lesson_status,
          limit: limit,
          offset: offset,
        }),
      );
    } catch (e) {
      next(e);
    }
  },
  createLesson: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(
        await db.lessons.service.createLesson({
          start_date: req.body.firstDate as Date,
          end_date: req.body.lastDate as Date,
          teacher_ids: req.body.teacherIds as number[],
          title: req.body.title as string,
          lesson_count: req.body.lessonsCount as number,
          days: req.body.days as number[]
        })
      )
    } catch (e) {
      next(e);
    }
  }
};

export default LessonsController;

