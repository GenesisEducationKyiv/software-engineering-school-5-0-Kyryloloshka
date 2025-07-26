import * as Joi from 'joi';

export const envNotificationValidationSchema = Joi.object({
  EMAIL_HOST: Joi.string().required(),
  EMAIL_PORT: Joi.number().integer().positive().required(),
  EMAIL_USER: Joi.string().required(),
  EMAIL_PASS: Joi.string().required(),
  APP_URL: Joi.string().uri().required(),
  RMQ_URL: Joi.string().uri().required(),
});
