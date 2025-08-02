import { Mail } from 'lucide-react';

interface ContactProps {
  title: string;
  email: string;
  text: string;
}

export default function Contact({ title, email, text }: ContactProps) {
  return (
    <section className='bg-gray-900 py-16 text-white'>
      <div className='container mx-auto px-4 text-center'>
        <h2 className='mb-8 text-3xl font-bold'>{title}</h2>
        {email && (
          <div className='flex items-center justify-center gap-2 text-lg'>
            <Mail className='h-5 w-5' />
            <a
              href={`mailto:${email}`}
              className='transition-colors hover:text-blue-400'
            >
              {email}
            </a>
          </div>
        )}
        {text && <p className='mx-auto mt-4 max-w-2xl text-gray-300'>{text}</p>}
      </div>
    </section>
  );
}
