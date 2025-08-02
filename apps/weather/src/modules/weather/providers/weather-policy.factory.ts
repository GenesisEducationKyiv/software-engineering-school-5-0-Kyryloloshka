import {
  circuitBreaker,
  handleAll,
  ConsecutiveBreaker,
  retry,
  ExponentialBackoff,
  wrap,
  IMergedPolicy,
  IRetryContext,
  IDefaultPolicyContext,
  CircuitBreakerPolicy,
  RetryPolicy,
} from 'cockatiel';
import { LoggerService } from '@lib/common';

export type WeatherProviderPolicy = IMergedPolicy<
  IRetryContext & IDefaultPolicyContext,
  never,
  [RetryPolicy, CircuitBreakerPolicy]
>;

export function createWeatherProviderPolicy(
  providerName: string,
  logger: typeof LoggerService,
): { policy: WeatherProviderPolicy; breaker: CircuitBreakerPolicy } {
  const breaker = circuitBreaker(handleAll, {
    halfOpenAfter: 10_000,
    breaker: new ConsecutiveBreaker(3),
  });
  breaker.onBreak(() => {
    logger.warn('Circuit breaker OPEN', providerName, { state: 'open' });
  });
  breaker.onReset(() => {
    logger.log('Circuit breaker CLOSED', providerName, { state: 'closed' });
  });
  breaker.onHalfOpen(() => {
    logger.log('Circuit breaker HALF-OPEN', providerName, {
      state: 'half-open',
    });
  });

  const retryPolicy = retry(handleAll, {
    maxAttempts: 3,
    backoff: new ExponentialBackoff({ initialDelay: 200, maxDelay: 1000 }),
  });
  retryPolicy.onRetry((info: any) => {
    const { attempt, delay } = info;
    const reason = info.reason ?? info.error ?? info.value;
    logger.warn(`Retry attempt #${attempt}`, providerName, {
      attempt,
      delay,
      reason: reason instanceof Error ? reason.message : String(reason),
    });
  });

  return { policy: wrap(retryPolicy, breaker), breaker };
}
