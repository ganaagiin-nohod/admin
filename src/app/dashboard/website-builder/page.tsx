'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Trash2, Eye, Save } from 'lucide-react';
import { IWebsite, IWebsiteComponent } from '@/models/Website';
import ImageUpload from '@/components/website/ImageUpload';

export default function WebsiteBuilderPage() {
  const { user } = useUser();
  const [websites, setWebsites] = useState<IWebsite[]>([]);
  const [currentWebsite, setCurrentWebsite] = useState<Partial<IWebsite>>({
    title: '',
    slug: '',
    components: []
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      const response = await fetch('/api/websites');
      const data = await response.json();
      setWebsites(data.websites || []);
    } catch (error) {
      console.error('Error fetching websites:', error);
      toast.error('Failed to load websites');
    }
  };

  const saveWebsite = async () => {
    if (!currentWebsite.title || !currentWebsite.slug) {
      toast.error('Please provide a title and slug');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentWebsite)
      });

      if (response.ok) {
        toast.success('Website saved successfully!');
        fetchWebsites();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save website');
      }
    } catch (error) {
      console.error('Error saving website:', error);
      toast.error('Failed to save website');
    } finally {
      setSaving(false);
    }
  };

  const addComponent = (type: IWebsiteComponent['type']) => {
    const newComponent: IWebsiteComponent = { type };

    switch (type) {
      case 'hero':
        newComponent.title = 'Welcome to My Site';
        newComponent.subtitle = 'This is my personal website';
        break;
      case 'about':
        newComponent.title = 'About Me';
        newComponent.text = 'Tell your story here...';
        break;
      case 'gallery':
        newComponent.title = 'Gallery';
        newComponent.images = [];
        break;
      case 'contact':
        newComponent.title = 'Contact Me';
        newComponent.email = user?.emailAddresses[0]?.emailAddress || '';
        break;
    }

    setCurrentWebsite((prev) => ({
      ...prev,
      components: [...(prev.components || []), newComponent]
    }));
  };

  const updateComponent = (
    index: number,
    updates: Partial<IWebsiteComponent>
  ) => {
    setCurrentWebsite((prev) => ({
      ...prev,
      components:
        prev.components?.map((comp, i) =>
          i === index ? { ...comp, ...updates } : comp
        ) || []
    }));
  };

  const removeComponent = (index: number) => {
    setCurrentWebsite((prev) => ({
      ...prev,
      components: prev.components?.filter((_, i) => i !== index) || []
    }));
  };

  const loadWebsite = (website: IWebsite) => {
    setCurrentWebsite(website);
  };

  const createNewWebsite = () => {
    setCurrentWebsite({
      title: '',
      slug: '',
      components: []
    });
  };

  const deployWebsite = async (websiteId: string) => {
    if (!websiteId) {
      toast.error('Website ID is required');
      return;
    }

    toast.loading('Deploying your website...', { id: 'deploy' });

    try {
      const response = await fetch('/api/deploy-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId, deploymentType: 'vercel' })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Website deployed successfully! 🎉`, { id: 'deploy' });
        toast.success(`Live at: ${data.url}`, { duration: 10000 });
        fetchWebsites(); // Refresh to show deployment URL
      } else {
        toast.error(`Deployment failed: ${data.error}`, { id: 'deploy' });
      }
    } catch (error) {
      console.error('Deployment error:', error);
      toast.error('Deployment failed', { id: 'deploy' });
    }
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Website Builder</h1>
        <div className='flex gap-2'>
          <Button onClick={createNewWebsite} variant='outline'>
            <Plus className='mr-2 h-4 w-4' />
            New Website
          </Button>
          <Button onClick={saveWebsite} disabled={saving}>
            <Save className='mr-2 h-4 w-4' />
            {saving ? 'Saving...' : 'Save Website'}
          </Button>
        </div>
      </div>

      <div className='grid gap-6 lg:grid-cols-4'>
        {/* Existing Websites Sidebar */}
        <div className='lg:col-span-1'>
          <Card>
            <CardHeader>
              <CardTitle>Your Websites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {websites.map((website, index) => (
                  <div
                    key={website._id?.toString() || `website-${index}`}
                    className='cursor-pointer rounded border p-3 hover:bg-gray-50'
                    onClick={() => loadWebsite(website)}
                  >
                    <div className='font-medium'>{website.title}</div>
                    <div className='text-sm text-gray-500'>/{website.slug}</div>
                    <div className='mt-2 flex gap-1'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/site/${website.slug}`, '_blank');
                        }}
                      >
                        <Eye className='h-3 w-3' />
                      </Button>
                      <Button
                        size='sm'
                        variant='default'
                        onClick={(e) => {
                          e.stopPropagation();
                          deployWebsite(website._id?.toString() || '');
                        }}
                      >
                        🚀
                      </Button>
                    </div>
                    {website.deploymentUrl && (
                      <div className='mt-1'>
                        <a
                          href={website.deploymentUrl}
                          target='_blank'
                          className='text-xs text-blue-600 hover:underline'
                        >
                          {website.deploymentUrl}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Editor */}
        <div className='lg:col-span-3'>
          <Card>
            <CardHeader>
              <CardTitle>{currentWebsite.title || 'New Website'}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue='settings' className='w-full'>
                <TabsList className='grid w-full grid-cols-2'>
                  <TabsTrigger value='settings'>Settings</TabsTrigger>
                  <TabsTrigger value='components'>Components</TabsTrigger>
                </TabsList>

                <TabsContent value='settings' className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='title'>Website Title</Label>
                      <Input
                        id='title'
                        value={currentWebsite.title || ''}
                        onChange={(e) =>
                          setCurrentWebsite((prev) => ({
                            ...prev,
                            title: e.target.value
                          }))
                        }
                        placeholder='My Awesome Website'
                      />
                    </div>
                    <div>
                      <Label htmlFor='slug'>URL Slug</Label>
                      <Input
                        id='slug'
                        value={currentWebsite.slug || ''}
                        onChange={(e) =>
                          setCurrentWebsite((prev) => ({
                            ...prev,
                            slug: e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, '-')
                          }))
                        }
                        placeholder='my-awesome-website'
                      />
                      {currentWebsite.slug && (
                        <p className='mt-1 text-sm text-gray-500'>
                          Your site will be available at: /site/
                          {currentWebsite.slug}
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value='components' className='space-y-4'>
                  <div className='mb-4 flex gap-2'>
                    <Button onClick={() => addComponent('hero')} size='sm'>
                      Add Hero
                    </Button>
                    <Button onClick={() => addComponent('about')} size='sm'>
                      Add About
                    </Button>
                    <Button onClick={() => addComponent('gallery')} size='sm'>
                      Add Gallery
                    </Button>
                    <Button onClick={() => addComponent('contact')} size='sm'>
                      Add Contact
                    </Button>
                  </div>

                  <div className='space-y-4'>
                    {currentWebsite.components?.map((component, index) => (
                      <ComponentEditor
                        key={index}
                        component={component}
                        index={index}
                        onUpdate={updateComponent}
                        onRemove={removeComponent}
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface ComponentEditorProps {
  component: IWebsiteComponent;
  index: number;
  onUpdate: (index: number, updates: Partial<IWebsiteComponent>) => void;
  onRemove: (index: number) => void;
}

function ComponentEditor({
  component,
  index,
  onUpdate,
  onRemove
}: ComponentEditorProps) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle className='capitalize'>{component.type} Section</CardTitle>
        <Button variant='destructive' size='sm' onClick={() => onRemove(index)}>
          <Trash2 className='h-4 w-4' />
        </Button>
      </CardHeader>
      <CardContent className='space-y-4'>
        {(component.type === 'hero' ||
          component.type === 'about' ||
          component.type === 'gallery' ||
          component.type === 'contact') && (
          <div>
            <Label>Title</Label>
            <Input
              value={component.title || ''}
              onChange={(e) => onUpdate(index, { title: e.target.value })}
              placeholder='Section title'
            />
          </div>
        )}

        {component.type === 'hero' && (
          <div>
            <Label>Subtitle</Label>
            <Input
              value={component.subtitle || ''}
              onChange={(e) => onUpdate(index, { subtitle: e.target.value })}
              placeholder='Section subtitle'
            />
          </div>
        )}

        {(component.type === 'about' || component.type === 'contact') && (
          <div>
            <Label>Text</Label>
            <Textarea
              value={component.text || ''}
              onChange={(e) => onUpdate(index, { text: e.target.value })}
              placeholder='Your content here...'
              rows={4}
            />
          </div>
        )}

        {component.type === 'about' && (
          <div>
            <Label>Image</Label>
            <ImageUpload
              value={component.image || ''}
              onChange={(url) => onUpdate(index, { image: url })}
            />
          </div>
        )}

        {component.type === 'gallery' && (
          <div>
            <Label>Images</Label>
            <ImageUpload
              value=''
              onChange={(url) => {
                const currentImages = component.images || [];
                onUpdate(index, { images: [...currentImages, url] });
              }}
              multiple
            />
            <div className='mt-2 grid grid-cols-3 gap-2'>
              {component.images?.map((image, imgIndex) => (
                <div key={imgIndex} className='relative'>
                  <img
                    src={image}
                    alt=''
                    className='h-20 w-full rounded object-cover'
                  />
                  <Button
                    size='sm'
                    variant='destructive'
                    className='absolute top-1 right-1 h-6 w-6 p-0'
                    onClick={() => {
                      const newImages =
                        component.images?.filter((_, i) => i !== imgIndex) ||
                        [];
                      onUpdate(index, { images: newImages });
                    }}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {component.type === 'contact' && (
          <div>
            <Label>Email</Label>
            <Input
              type='email'
              value={component.email || ''}
              onChange={(e) => onUpdate(index, { email: e.target.value })}
              placeholder='your@email.com'
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
