import Link from "next/link";

const blocks = [
  {
    title: 'Accurate Forecast',
    description: 'Data from multiple sources for maximum accuracy.',
  },
  {
    title: 'Notification Subscription',
    description: 'Receive email notifications about weather changes in your region.',
  },
  {
    title: 'User-Friendly Interface',
    description: 'Intuitive design for quick access to information.',
  },
]

export default async function Home() {
  return (
    <main className="flex-auto primary-container flex flex-col items-center justify-center gap-16 py-12 relative">
      <section className="flex flex-col items-center text-center gap-4">
        <h1 className="text-5xl font-bold text-primary text-shadow-lg">Weather Service</h1>
        <p className="text-lg text-gray-600 max-w-xl">
          Get the most up-to-date weather information and subscribe to notifications. A reliable service for your comfort and safety.
        </p>
      </section>
      <section className="w-full flex flex-col md:flex-row justify-center gap-8 items-center md:items-stretch">
        {blocks.map((block, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6 flex-1 max-w-xs">
            <h2 className="text-xl font-semibold mb-2 text-primary">{block.title}</h2>
            <p className="text-gray-600">{block.description}</p>
          </div>
        ))}
      </section>
      <section className="flex flex-col items-center gap-4">
        <h3 className="text-2xl font-bold text-primary">Try it now!</h3>
        <Link
          href="/subscribe"
          className="bg-primary text-white px-6 py-3 rounded-lg shadow hover:bg-primary-dark transition"
        >
          Subscribe to notifications
        </Link>
      </section>
      <div className="fixed bottom-4 right-6 text-xs text-primary select-none pointer-events-none z-50 hidden md:block">
        Created by Haliamov Kyrylo
      </div>
    </main>
  );
}
