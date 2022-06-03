import { pgp } from "../../db";
import { CreateLesson, ListLessons } from "../../types";

const LessonsModel = {
  listLessons: async (data: ListLessons) => {
    try {
      return pgp.as.format(`
        SELECT count(*) OVER()::int as count,
               l.id,
               l.date as date,
               l.title,
               l.status,
               count(CASE WHEN ls.visit IS TRUE THEN 1 END) as visitCount,
               json_agg(
                   json_build_object(
                       'id', s.id,
                       'name', s.name,
                       'visit', ls.visit
                       )
                   ) as students,
            json_agg(
                   json_build_object(
                       'id', t.id,
                       'name', t.name
                       )
                   ) as teachers
        FROM lessons l
                 LEFT JOIN lesson_teachers lt on l.id = lt.lesson_id
                 LEFT JOIN teachers t on lt.teacher_id = t.id
                 LEFT JOIN lesson_students ls on l.id = ls.lesson_id
                 LEFT JOIN students s on ls.student_id = s.id
        WHERE l.status = $1::int
          AND lt.teacher_id = ANY ($2::int[])
          AND CASE
            WHEN $4 IS NOT NULL THEN l.date BETWEEN $3 AND $4
            ELSE $3 = l.date END
        GROUP BY l.id
        HAVING CASE
            WHEN $6::int IS NOT NULL THEN count(ls.student_id) BETWEEN $5::int AND $6::int
            ELSE count(ls.student_id) = $5::int END
        LIMIT $7::int OFFSET $8::int
      `, [
        data.lesson_status, data.teacher_ids, data.lesson_first_date, data.lesson_second_date,
        data.student_count_first_number, data.student_count_second_number, data.limit, data.offset
      ])
    } catch (e) {
      throw e;
    }
  },
  createLesson: async (data: CreateLesson) => {
    try {
      return pgp.as.format(`
        INSERT INTO lessons(date, title)
        SELECT generate_series as date, '${data.title}'::varchar as title 
        FROM generate_series($1::date, $2::date,'1 day')
        WHERE extract(dow from generate_series::date) - 1 = ANY($3::int[])
        LIMIT $4::int
        RETURNING id
      `, [data.start_date, data.end_date, data.days, data.lesson_count])
    } catch (e) {
      throw e;
    }
  },
};

export default LessonsModel;