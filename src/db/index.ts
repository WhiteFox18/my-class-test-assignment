import * as promise from "bluebird"; // best promise library today
import pgPromise, { ICTFObject, IDatabase, IFormattingOptions, QueryFile } from "pg-promise";
import dotenv from "dotenv";
import LessonsModel from "../services/models/LessonsModel";
import LessonsService from "../services/LessonsService";
import fs from "fs";
import path from "path";

dotenv.config()

interface IExtensions {
    lessons: {
        query: typeof LessonsModel,
        service: LessonsService
    }
}

export type ExtendedDatabase = IDatabase<IExtensions> & IExtensions

const initOptions: any = {
    capSQL: true,
    // Using a custom promise library, instead of the default ES6 Promise:
    promiseLib: promise,

    // Extending the database protocol with our custom repositories;
    // API: http://vitaly-t.github.io/pg-promise/global.html#event:extend
    extend(db: ExtendedDatabase, dc: any) {
        // Database Context (dc) is mainly needed for extending multiple databases with different access API.

        // Do not use 'require()' here, because this event occurs for every task and transaction being executed,
        // which should be as fast as possible.
        //  TODO: Create repo classes that include only SQL queries as methods and extend obj with repos
        db.lessons = {
            query: LessonsModel,
            service: new LessonsService({db, pgp})
        }
    }
};


const pgp = pgPromise(initOptions)

const connectionObject = {
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    port: Number(process.env.DATABASE_PORT),
}

// To write every query from pgp.as.format into the file
if(process.env.PRODUCTION !== "true") {
    const oldFormat = pgp.as.format
    pgp.as.format = (query: string | QueryFile | ICTFObject, values?: any, options?: IFormattingOptions): string => {
        const queryToReturn = oldFormat(query, values, options)

        let formatted = queryToReturn

        formatted += "\n"
        formatted += "##############################"
        formatted += "\n"

        fs.writeFileSync(path.join(path.resolve(), "constants", "queries.txt"), formatted, {
            flag: "a"
        })

        return queryToReturn
    }
}

const db: ExtendedDatabase = pgp(connectionObject)

export default db
export { pgp }