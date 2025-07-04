export default () => ({
  email: {
    cronHourly: process.env.EMAIL_CRON_HOURLY || '0 * * * *',
    cronDaily: process.env.EMAIL_CRON_DAILY || '0 9 * * *',
    batchSize: parseInt(process.env.EMAIL_BATCH_SIZE || '100', 10),
    tokenTtlMinutes: parseInt(process.env.EMAIL_TOKEN_TTL || '60', 10),
    from: process.env.EMAIL_FROM || 'noreply@example.com',
  },
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true',
    weatherTtlSeconds: parseInt(process.env.CACHE_WEATHER_TTL || '600', 10),
  },
  weather: {
    provider: process.env.WEATHER_PROVIDER || 'weatherapi',
    httpTimeoutMs: parseInt(process.env.WEATHER_HTTP_TIMEOUT || '5000', 10),
  },
  limits: {
    maxSubscriptionsPerUser: parseInt(process.env.MAX_SUBSCRIPTIONS || '5', 10),
  },
  locale: {
    timezone: process.env.TIMEZONE || 'UTC',
    language: process.env.LANGUAGE || 'en',
  },
});
