import { Injectable } from '@nestjs/common';
import { Counter, Registry } from 'prom-client';

@Injectable()
export class MetricsService {
  public readonly subscribeCounter: Counter<string>;
  public readonly confirmCounter: Counter<string>;
  public readonly unsubscribeCounter: Counter<string>;
  public readonly errorCounter: Counter<string>;
  public readonly registry: Registry;

  constructor() {
    this.registry = new Registry();

    this.subscribeCounter = new Counter({
      name: 'subscription_subscribe_total',
      help: 'Total number of subscription creations',
      registers: [this.registry],
    });
    this.confirmCounter = new Counter({
      name: 'subscription_confirm_total',
      help: 'Total number of subscription confirmations',
      registers: [this.registry],
    });
    this.unsubscribeCounter = new Counter({
      name: 'subscription_unsubscribe_total',
      help: 'Total number of unsubscriptions',
      registers: [this.registry],
    });
    this.errorCounter = new Counter({
      name: 'subscription_error_total',
      help: 'Total number of errors in subscription flow',
      registers: [this.registry],
    });
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  get contentType(): string {
    return this.registry.contentType;
  }
}
