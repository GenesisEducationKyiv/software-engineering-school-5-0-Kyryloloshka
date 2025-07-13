import { WeatherResponse } from 'src/common/types/weather';

export interface IEmailService {
  sendConfirmationEmail(email: string, token: string): Promise<void>;

  sendWeatherUpdate({
    email,
    city,
    token,
    weather,
  }: {
    email: string;
    city: string;
    token: string;
    weather: WeatherResponse;
  }): Promise<void>;
}
