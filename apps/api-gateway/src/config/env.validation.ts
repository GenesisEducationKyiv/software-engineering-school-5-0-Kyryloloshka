import * as Joi from 'joi';

export const envApiGatewayValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().integer().positive().required(),
  WEATHER_SERVICE_URL: Joi.string().uri().required(),
  SUBSCRIPTION_SERVICE_URL: Joi.string().uri().required(),
  SERVICE_NAME: Joi.string().default('api-gateway'),
}).unknown(true);
