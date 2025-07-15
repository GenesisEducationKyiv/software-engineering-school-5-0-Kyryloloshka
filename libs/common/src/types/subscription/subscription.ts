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
  Subscribe(request: CreateSubscriptionDto): Observable<SubscribeResponse>;
  Confirm(
    request: ConfirmSubscriptionDto,
  ): Observable<ConfirmSubscriptionResponse>;
  Unsubscribe(request: UnsubscribeDto): Observable<UnsubscribeResponse>;
}

export const SUBSCRIPTION_PACKAGE_NAME = 'subscription';
export const SUBSCRIPTION_SERVICE_NAME = 'SubscriptionService';
