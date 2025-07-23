'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Weather } from "@/lib/types/weather";
import { useState } from "react";


export default function GetWeatherPage() {
  const [city, setCity] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setWeather(null);
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(cityInput)}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.message || data.error || "Weather unavailable");
        setCity(cityInput);
      } else {
        setWeather(data);
        setCity(cityInput);
      }
    } catch {
      setError("Weather unavailable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-auto primary-container flex flex-col items-center justify-center gap-12 py-12 relative min-h-[80vh]">
      <section className="flex flex-col items-center text-center gap-4">
        <h1 className="text-4xl font-bold text-primary text-shadow-lg">Get Weather</h1>
        <p className="text-lg text-gray-600 max-w-xl">
          Enter your city to get the current weather information.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6 items-center w-full max-w-sm">
          <Input
            type="text"
            value={cityInput}
            onChange={e => setCityInput(e.target.value)}
            placeholder="Enter city name"
            size="lg"
            required={true}
          />
          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full cursor-pointer text-lg"
          >
            {loading ? "Loading..." : "Get Weather"}
          </Button>
        </form>
        {error && <div className="text-red-500 mt-4">{error}</div>}
        {weather && !error && (
          <div className="mt-6 flex flex-col items-center gap-1 text-lg">
            <h2 className="text-2xl font-semibold mb-2 text-primary">Current Weather in {city}</h2>
            <span>Temperature: <b>{weather.temperature}&deg;C</b></span>
            <span>Humidity: <b>{weather.humidity}%</b></span>
            <span>Description: <b>{weather.description}</b></span>
          </div>
        )}
      </section>
      <div className="fixed bottom-4 right-6 text-xs text-primary select-none pointer-events-none z-50 hidden md:block">
        Created by Haliamov Kyrylo
      </div>
    </main>
  );
} 