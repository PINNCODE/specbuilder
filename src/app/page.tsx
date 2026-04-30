export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-black text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Spec Builder</h1>
        <p className="text-lg text-gray-400 mb-8">
          Transform your product idea into a complete, development-ready technical spec.
        </p>
        <a
          href="/builder"
          className="inline-block bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
        >
          Create Your Spec
        </a>
      </div>
    </main>
  );
}