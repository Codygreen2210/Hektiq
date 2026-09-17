export default function Communities() {
  const communities = [
    { emoji: '💰', name: 'Money Moves', slug: 'money-moves', desc: 'Personal finance, saving, passive income' },
    { emoji: '🚀', name: 'Builders', slug: 'builders', desc: 'Startups, side hustles, indie building' },
    { emoji: '📈', name: 'Market Moves', slug: 'market-moves', desc: 'Stocks, crypto, options, macro' },
    { emoji: '💡', name: 'The Grind', slug: 'the-grind', desc: 'Career, negotiating, getting ahead' },
    { emoji: '📚', name: 'From Nothing', slug: 'from-nothing', desc: 'Rags to riches, motivation, mindset' },
  ]
  return (
    <main className='min-h-screen bg-[#0F172A] text-white'>
      <header className='border-b border-gray-800 px-6 py-4 flex justify-between items-center'>
        <a href='/' className='text-2xl font-bold text-blue-400'>Hektiq</a>
        <div className='flex gap-4'>
          <a href='/auth/login' className='text-gray-300 hover:text-white'>Login</a>
          <a href='/auth/signup' className='bg-blue-500 px-4 py-2 rounded text-white'>Join</a>
        </div>
      </header>
      <section className='px-6 py-12 max-w-5xl mx-auto'>
        <h2 className='text-3xl font-bold mb-2'>Communities</h2>
        <p className='text-gray-400 mb-8'>For everyone building from nothing.</p>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {communities.map((c) => (
            <a key={c.slug} href={'community/' + c.slug} className='border border-gray-700 rounded p-6 hover:border-blue-500 block'>
              <div className='text-3xl mb-3'>{c.emoji}</div>
              <h3 className='font-bold text-lg mb-2'>{c.name}</h3>
              <p className='text-gray-400 text-sm mb-4'>{c.desc}</p>
            </a>
          ))}
        </div>
      </section>
      <footer className='border-t border-gray-800 px-6 py-8 text-center text-gray-500 text-sm'>
        <p>Hektiq 2026 - For everyone building from nothing</p>
      </footer>
    </main>
  )
}