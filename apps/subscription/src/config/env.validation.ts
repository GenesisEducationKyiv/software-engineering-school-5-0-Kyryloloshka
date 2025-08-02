import * as Joi from 'joi';

export const envSubscriptionValidationSchema = Joi.object({
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().integer().positive().required(),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),

  PORT: Joi.number().integer().positive().required(),

  PGADMIN_EMAIL: Joi.string().email().required(),
  PGADMIN_PASSWORD: Joi.string().required(),
  RMQ_URL: Joi.string().uri().required(),
  WEATHER_SERVICE_URL: Joi.string().uri().required(),
  GRPC_URL: Joi.string().required(),
  SERVICE_NAME: Joi.string().default('subscription'),
}).unknown(true);
