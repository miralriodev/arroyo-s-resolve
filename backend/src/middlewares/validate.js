import { checkSchema, validationResult } from 'express-validator';

export function validate(schema) {
  const validations = checkSchema(schema, ['body']);
  const handler = (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    next();
  };
  return [...validations, handler];
}
