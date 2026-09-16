export default function Home() {
  return (
    <main className="min-h-screen bg-[#0F172A] text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-400">Hektiq</h1>
        <div className="flex gap-4">
          <a href="/auth/login" className="text-gray-300 hover:text-white">Login</a>
          <a href="/auth/signup" className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white">Join</a>
        </div>
      </header>
      <section className="px-6 py-20 text-center max-w-3xl mx-auto">
        <h2 className="text-5xl font-bold mb-6">Finance without the fragmentation</h2>
        <p className="text-xl text-gray-400 mb-10">One place for founders, traders, and learners to discuss money.</p>
        <a href="/auth/signup" className="bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded text-white text-lg font-medium">Join the community</a>
      </section>
      <footer className="border-t border-gray-800 px-6 py-8 text-center text-gray-500 text-sm">
        <p>Hektiq 2026 - Making financial literacy accessible to everyone</p>
      </footer>
    </main>
  )
}