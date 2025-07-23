"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import React, { useState } from 'react'

const SubscribePage = () => {
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, city, frequency }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.message || data.error || 'Subscription failed');
      } else {
        setSuccess('Check your email to confirm your subscription!');
        setEmail('');
        setCity('');
        setFrequency('daily');
      }
    } catch {
      setError('Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-auto primary-container flex flex-col items-center justify-center gap-8 py-12 relative text-center">
      <h1 className="text-5xl font-bold text-primary text-shadow-lg">Subscribe to notifications</h1>
      <p className="text-lg text-gray-600 max-w-xl">
        Enter your email to subscribe to notifications about weather changes in your region.
      </p>
      <form className="w-full max-w-md" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              type="text"
              placeholder="Enter city name"
              required
              value={city}
              onChange={e => setCity(e.target.value)}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={frequency}
              onValueChange={setFrequency}
              required
            >
              <SelectTrigger className="w-full bg-white ring-0">
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </div>
          {error && <div className="text-red-500 mt-2">{error}</div>}
          {success && <div className="text-green-700 mt-2">{success}</div>}
        </div>
      </form>
    </main>
  )
}

export default SubscribePage
