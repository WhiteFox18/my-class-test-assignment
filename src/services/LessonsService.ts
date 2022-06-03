import { CreateLesson, DatabaseClient, ListLessons, ServiceProps } from "../types";
import LessonsModel from "./models/LessonsModel";
import { ExtendedDatabase } from "../db";
import { paginate } from "../modules/helpers";

export default class LessonsService {
  private db: ExtendedDatabase = null;
  private pgp: DatabaseClient = null;

  constructor(props: ServiceProps) {
    this.db = props.db;
    this.pgp = props.pgp;
  }

  listLessons = async (data: ListLessons) => {
    try {
      return paginate(
        await this.db.manyOrNone(
          await this.db.lessons.query.listLessons(data),
        ),
      );
    } catch (e) {
      throw e;
    }
  };

  createLesson = async (data: CreateLesson) => {
    try {
      return await this.db.tx(async (transaction) => {
          const lessons_ids = await transaction.manyOrNone(
            await transaction.lessons.query.createLesson(data),
          );

          let to_return: number[] = [];
          let to_insert: { lesson_id: number; teacher_id: number }[] = [];

          lessons_ids.forEach((lesson: { id: number }) => {
            to_return.push(lesson.id);

            data.teacher_ids.forEach((teacher_id: number) => {
              to_insert.push({
                lesson_id: lesson.id,
                teacher_id: teacher_id,
              });
            });
          });

          if (to_insert.length > 0) {
            await transaction.none(
              this.pgp.helpers.insert(
                to_insert,
                ["lesson_id", "teacher_id"],
                "lesson_teachers",
              ),
            );
          }

          return {
            lesson_ids: to_return,
          };
        },
      );
    } catch (e) {
      throw e;
    }
  };
}