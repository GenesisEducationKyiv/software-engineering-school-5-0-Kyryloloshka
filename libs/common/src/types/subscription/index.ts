export * from './dto/create-subscription.dto';
export * from './subscription';

// Domain types for repository interfaces
export interface CreateSubscriptionData {
  email: string;
  city: string;
  frequency: import('../frequency').Frequency;
  token: string;
}
