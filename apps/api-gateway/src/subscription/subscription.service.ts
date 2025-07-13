import { Injectable, Inject } from '@nestjs/common';
import { ISubscriptionService } from './interfaces/subscription-service.interface';
import { ClientGrpc } from '@nestjs/microservices';
import {
  ConfirmSubscriptionDto,
  SUBSCRIPTION_SERVICE_NAME,
  UnsubscribeDto,
  CreateSubscriptionDto,
  SubscribeResponse,
  ConfirmSubscriptionResponse,
  UnsubscribeResponse,
} from '@lib/common';
import { firstValueFrom } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class SubscriptionService implements ISubscriptionService {
  private subscriptionService: any;

  constructor(
    @Inject('SUBSCRIPTION_CLIENT')
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.subscriptionService = this.client.getService<any>(
      SUBSCRIPTION_SERVICE_NAME,
    );
  }

  async subscribe(dto: CreateSubscriptionDto): Promise<SubscribeResponse> {
    try {
      return await firstValueFrom(this.subscriptionService.subscribe(dto));
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException(error.message || 'Internal server error');
    }
  }

  async confirmSubscription(
    dto: ConfirmSubscriptionDto,
  ): Promise<ConfirmSubscriptionResponse> {
    try {
      return await firstValueFrom(this.subscriptionService.Confirm(dto));
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException(error.message || 'Internal server error');
    }
  }

  async unsubscribe(dto: UnsubscribeDto): Promise<UnsubscribeResponse> {
    try {
      return await firstValueFrom(this.subscriptionService.unsubscribe(dto));
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException(error.message || 'Internal server error');
    }
  }
}
