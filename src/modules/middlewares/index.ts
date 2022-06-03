import {Request, Response, NextFunction} from "express";
import {validationResult} from "express-validator";

export const validate = (validations: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation: any) => validation.run(req)));

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    const errorsArray: any = [];

    await errors.array().forEach(error => {
      if (!errorsArray.includes(error.param))
        errorsArray.push(error.param);
    });

    return res.status(400).json({
      error: {
        type: "validation",
        description: "validation",
        fields: errorsArray
      }
    });
  };
};