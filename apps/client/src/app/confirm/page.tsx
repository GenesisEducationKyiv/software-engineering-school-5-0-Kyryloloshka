'use client'
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const ConfirmPage = () => {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Please wait…');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setMessage('Token is missing 😞');
      return;
    }

    const confirm = async () => {
      try {
        const res = await fetch(`/api/confirm/${token}`);
        const json = await res.json();
        setMessage(res.ok ? 'Subscription confirmed 🎉' : json.message || 'Error');
      } catch (e) {
        setMessage('Network error');
      }
    };
    confirm();
  }, [searchParams]);

  return (
    <main className="flex-auto primary-container flex flex-col items-center justify-center gap-8 py-12 relative min-h-[80vh] text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-primary text-shadow-lg">Confirming your subscription…</h1>
      <div className={`mt-4 text-lg ${message.includes('confirmed') ? 'text-green-800' : message.includes('error') || message.includes('missing') ? 'text-red-500' : 'text-gray-700'}`}>{message}</div>
    </main>
  );
};

export default ConfirmPage;