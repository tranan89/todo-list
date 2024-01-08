import Koa from 'koa';
import Joi from 'joi';

type Schemas = {
  body?: Joi.Schema;
  query?: Joi.Schema;
  params?: Joi.Schema;
};
type Args = {
  ctx: Koa.Context;
  schemas: Schemas;
};

const validate = ({ ctx, schemas }: Args) => {
  const { body: bodySchema, query: querySchema, params: paramsSchema } = schemas;
  const { query = {}, params = {}, request: { body = {} } = {} } = ctx;
  let errorMsg = '';

  if (bodySchema) {
    const { error } = bodySchema.validate(body);

    if (error) {
      errorMsg += `Body validation error: ${error.message} `;
    }
  }
  if (querySchema) {
    const { error } = querySchema.validate(query);

    if (error) {
      errorMsg += `Query validation error: ${error.message} `;
    }
  }
  if (paramsSchema) {
    const { error } = paramsSchema.validate(params);

    if (error) {
      errorMsg += `Params validation error: ${error.message} `;
    }
  }
  errorMsg = errorMsg.trim();

  return ctx.assert(!errorMsg, 400, errorMsg);
};

export default validate;
