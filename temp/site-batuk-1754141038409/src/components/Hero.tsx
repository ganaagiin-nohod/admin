interface HeroProps {
  title: string;
  subtitle: string;
}

export default function Hero({ title, subtitle }: HeroProps) {
  return (
    <section className='bg-gradient-to-r from-blue-600 to-purple-600 py-20 text-white'>
      <div className='container mx-auto px-4 text-center'>
        <h1 className='mb-4 text-5xl font-bold'>{title}</h1>
        <p className='text-xl opacity-90'>{subtitle}</p>
      </div>
    </section>
  );
}
