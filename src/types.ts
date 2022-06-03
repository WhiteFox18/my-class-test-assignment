import pgPromise from "pg-promise";
import { IClient } from "pg-promise/typescript/pg-subset";
import { ExtendedDatabase } from "./db";

export type DatabaseClient = pgPromise.IMain<{}, IClient>

export interface ServiceProps {
  db: ExtendedDatabase;
  pgp: DatabaseClient;
}

interface Paginate {
  limit: number;
  offset: number;
}

export interface ListLessons extends Paginate {
  lesson_first_date: Date;
  lesson_second_date?: Date;
  student_count_first_number: number;
  student_count_second_number?: number;
  lesson_status: number;
  teacher_ids: number[];
}

export interface CreateLesson {
  teacher_ids: number[];
  title: string;
  days: number[];
  start_date: Date;
  end_date: Date;
  lesson_count: number;
}