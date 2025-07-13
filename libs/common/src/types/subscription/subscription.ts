import { Observable } from 'rxjs';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

export interface SubscribeResponse {
  message: string;
  token: string;
}

export interface ConfirmSubscriptionResponse {
  message: string;
}

export interface UnsubscribeResponse {
  message: string;
}

export interface ConfirmSubscriptionDto {
  token: string;
}

export interface UnsubscribeDto {
  token: string;
}

export interface SubscriptionServiceClient {
  subscribe(request: CreateSubscriptionDto): Observable<SubscribeResponse>;
  confirmSubscription(
    request: ConfirmSubscriptionDto,
  ): Observable<ConfirmSubscriptionResponse>;
  unsubscribe(request: UnsubscribeDto): Observable<UnsubscribeResponse>;
}

export const SUBSCRIPTION_PACKAGE_NAME = 'subscription';
export const SUBSCRIPTION_SERVICE_NAME = 'SubscriptionService';
