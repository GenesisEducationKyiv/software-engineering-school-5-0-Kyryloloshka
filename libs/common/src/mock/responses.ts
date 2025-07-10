export const mockWeatherApiResponse = {
  current: {
    temp_c: 10,
    humidity: 50,
    condition: {
      text: 'Sunny',
    },
  },
};

export const mockOpenMeteoGeoResponse = {
  results: [
    {
      latitude: 40.7128,
      longitude: -74.006,
    },
  ],
};

export const mockOpenMeteoWeatherResponse = {
  current: {
    temperature_2m: 10,
    relative_humidity_2m: 50,
    weather_code: 1,
  },
};
