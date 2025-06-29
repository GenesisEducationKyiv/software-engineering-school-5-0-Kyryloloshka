import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().integer().positive().required(),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),

  PORT: Joi.number().integer().positive().required(),

  WEATHER_BASE_API_URL: Joi.string().uri().required(),
  WEATHER_API_KEY: Joi.string().required(),

  OPENMETEO_BASE_API_URL: Joi.string().uri().required(),
  OPENMETEO_GEO_API_URL: Joi.string().uri().required(),

  EMAIL_HOST: Joi.string().required(),
  EMAIL_PORT: Joi.number().integer().positive().required(),
  EMAIL_USER: Joi.string().email().required(),
  EMAIL_PASS: Joi.string().required(),

  APP_URL: Joi.string().uri().required(),

  PGADMIN_EMAIL: Joi.string().email().required(),
  PGADMIN_PASSWORD: Joi.string().required(),
});
