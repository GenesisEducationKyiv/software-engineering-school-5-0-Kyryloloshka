import * as Joi from 'joi';

export const envWeatherValidationSchema = Joi.object({
  PORT: Joi.number().integer().positive().required(),

  WEATHER_BASE_API_URL: Joi.string().uri().required(),
  WEATHER_API_KEY: Joi.string().required(),

  OPENMETEO_BASE_API_URL: Joi.string().uri().required(),
  OPENMETEO_GEO_API_URL: Joi.string().uri().required(),

  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().integer().positive().default(6379),

  CACHE_ENABLED: Joi.boolean().default(true),
  CACHE_WEATHER_TTL: Joi.number().integer().positive().default(600),

  GRPC_URL: Joi.string().required(),
  SERVICE_NAME: Joi.string().default('weather'),
});
