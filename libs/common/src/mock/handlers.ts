import { http, HttpResponse, passthrough } from 'msw';
import {
  mockOpenMeteoGeoResponse,
  mockOpenMeteoWeatherResponse,
  mockWeatherApiResponse,
} from './responses';

export const handlers = [
  http.all('http://127.0.0.1*', () => passthrough()),
  http.get('https://api.weatherapi.com/v1/current.json', ({ request }) => {
    const url = new URL(request.url);
    const city = url.searchParams.get('q');
    const key = url.searchParams.get('key');

    if (!city || !key) {
      return HttpResponse.error();
    }

    return HttpResponse.json(mockWeatherApiResponse);
  }),
  http.get('https://geocoding-api.open-meteo.com/v1/search', ({ request }) => {
    const url = new URL(request.url);
    const city = url.searchParams.get('name');

    if (!city) {
      return HttpResponse.error();
    }

    return HttpResponse.json(mockOpenMeteoGeoResponse);
  }),
  http.get('https://api.open-meteo.com/v1/forecast', ({ request }) => {
    const url = new URL(request.url);
    const latitude = url.searchParams.get('latitude');
    const longitude = url.searchParams.get('longitude');

    if (!latitude || !longitude) {
      return HttpResponse.error();
    }

    return HttpResponse.json(mockOpenMeteoWeatherResponse);
  }),
];
