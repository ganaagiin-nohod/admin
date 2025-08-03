import { notFound } from 'next/navigation';
import WebsiteRenderer from '@/components/website/WebsiteRenderer';
import { IWebsite } from '@/models/Website';
import connectDB from '@/lib/mongodb';
import Website from '@/models/Website';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getWebsite(slug: string): Promise<IWebsite | null> {
  try {
    if (slug === 'demo-portfolio') {
      await connectDB();
      let demoWebsite = await Website.findOne({ slug: 'demo-portfolio' });

      if (!demoWebsite) {
        demoWebsite = new Website({
          userId: 'demo-user',
          slug: 'demo-portfolio',
          title: 'John Doe - Portfolio',
          components: [
            {
              type: 'hero',
              title: "Hi, I'm John Doe",
              subtitle: 'Full-Stack Developer & Designer'
            },
            {
              type: 'about',
              title: 'About Me',
              text: "I'm a passionate full-stack developer with 5+ years of experience building web applications. I love creating beautiful, functional websites that solve real problems.",
              image:
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
            },
            {
              type: 'gallery',
              title: 'My Work',
              images: [
                'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop'
              ]
            },
            {
              type: 'contact',
              title: 'Get In Touch',
              email: 'john@example.com',
              text: "I'm always interested in new opportunities and collaborations. Feel free to reach out!"
            }
          ]
        });

        await demoWebsite.save();
      }

      return demoWebsite;
    }

    await connectDB();
    const website = await Website.findOne({ slug });
    return website;
  } catch (error) {
    console.error('Error fetching website:', error);
    return null;
  }
}

export default async function SitePage({ params }: PageProps) {
  const { slug } = await params;
  const website = await getWebsite(slug);

  if (!website) {
    notFound();
  }

  return (
    <>
      <title>{website.title}</title>
      <WebsiteRenderer website={website} />
    </>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const website = await getWebsite(slug);

  if (!website) {
    return {
      title: 'Site Not Found'
    };
  }

  return {
    title: website.title,
    description: `Personal website for ${website.title}`
  };
}
