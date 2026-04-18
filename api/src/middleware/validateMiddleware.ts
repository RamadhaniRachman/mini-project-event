import { Request, Response, NextFunction } from "express";
import { z } from "zod";

// z.ZodTypeAny sebagai tipe universal
export const validate = (schema: z.ZodTypeAny) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    try {
      const result = await schema.safeParseAsync(req.body);

      if (!result.success) {
        const fieldErrors: Record<string, string[]> = {};

        result.error.issues.forEach((issue) => {
          const field = issue.path[0] as string;
          if (!fieldErrors[field]) {
            fieldErrors[field] = [];
          }
          fieldErrors[field].push(issue.message);
        });

        return res.status(400).json({
          status: "error",
          message: "Data tidak lengkap!",
          errors: fieldErrors,
        });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};
