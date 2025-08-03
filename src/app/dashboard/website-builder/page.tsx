'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Eye,
  Save,
  Globe,
  Rocket,
  Settings,
  Layout,
  ImageIcon,
  User,
  Mail,
  ExternalLink,
  Sparkles,
  Wand2
} from 'lucide-react';
import type { IWebsite, IWebsiteComponent } from '@/models/Website';
import ImageUpload from '@/components/website/ImageUpload';
import AIContentDialog from '@/components/website/AIContentDialog';

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
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showAiDialog, setShowAiDialog] = useState(false);

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
      case 'products':
        newComponent.title = 'Products';
        newComponent.products = [];
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

    toast.loading(
      '🚀 Creating real Vercel project... (this may take 1-2 minutes)',
      { id: 'deploy' }
    );

    try {
      console.log('🚀 Starting deployment for website:', websiteId);

      const response = await fetch('/api/deploy-working', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        toast.error(`HTTP ${response.status}: ${errorText}`, { id: 'deploy' });
        return;
      }

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (data.success) {
        toast.success(`🎉 Website deployed successfully!`, { id: 'deploy' });
        toast.success(`🌐 Live at: ${data.url}`, { duration: 15000 });
        fetchWebsites();
      } else {
        toast.error(`Deployment failed: ${data.error}`, { id: 'deploy' });
        if (data.details) {
          console.error('Error details:', data.details);
        }
      }
    } catch (error) {
      console.error('❌ Deployment error:', error);
      toast.error(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { id: 'deploy' }
      );
    }
  };

  const generateAIContent = async (
    description: string,
    businessType: string,
    tone: string
  ) => {
    setAiGenerating(true);
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          businessType,
          tone,
          fullWebsite: true
        })
      });

      const data = await response.json();

      if (data.success) {
        const { hero, about, products, contact } = data.content;

        // Create components from AI-generated content
        const aiComponents: IWebsiteComponent[] = [];

        if (hero) {
          aiComponents.push({
            type: 'hero',
            title: hero.title,
            subtitle: hero.subtitle
          });
        }

        if (about) {
          aiComponents.push({
            type: 'about',
            title: about.title,
            text: about.text
          });
        }

        if (products && products.products) {
          aiComponents.push({
            type: 'products',
            title: products.title,
            products: products.products
          });
        }

        if (contact) {
          aiComponents.push({
            type: 'contact',
            title: contact.title,
            text: contact.text,
            email: user?.emailAddresses[0]?.emailAddress || ''
          });
        }

        // Update current website with AI-generated content
        setCurrentWebsite((prev) => ({
          ...prev,
          components: aiComponents
        }));

        toast.success('🤖 AI content generated successfully!');
        setShowAiDialog(false);
      } else {
        toast.error('Failed to generate AI content: ' + data.error);
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate AI content');
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='sticky top-0 z-50 border-b bg-white shadow-sm'>
        <div className='container mx-auto px-4 py-4 sm:px-6'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white'>
                <Globe className='h-5 w-5' />
              </div>
              <div>
                <h1 className='text-xl font-semibold text-gray-900 sm:text-2xl'>
                  Website Builder
                </h1>
                <p className='hidden text-sm text-gray-600 sm:block'>
                  Create and manage your websites
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <Button
                onClick={createNewWebsite}
                variant='outline'
                size='sm'
                className='bg-transparent text-sm'
              >
                <Plus className='mr-2 h-4 w-4' />
                New Website
              </Button>
              <Button
                onClick={saveWebsite}
                disabled={saving}
                size='sm'
                className='bg-gray-900 text-sm hover:bg-gray-800'
              >
                <Save className='mr-2 h-4 w-4' />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto p-4 sm:p-6'>
        <div className='grid gap-6 lg:grid-cols-12'>
          <div className='lg:col-span-4 xl:col-span-3'>
            <Card className='h-fit'>
              <CardHeader className='pb-4'>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <Globe className='h-5 w-5 text-gray-600' />
                  Your Websites
                </CardTitle>
                <p className='text-sm text-gray-500'>Manage your projects</p>
              </CardHeader>
              <CardContent>
                <div className='max-h-[calc(100vh-300px)] space-y-3 overflow-y-auto'>
                  {websites.length === 0 ? (
                    <div className='py-8 text-center'>
                      <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100'>
                        <Globe className='h-8 w-8 text-gray-400' />
                      </div>
                      <p className='text-sm text-gray-500'>No websites yet</p>
                      <p className='mt-1 text-xs text-gray-400'>
                        Create your first website to get started
                      </p>
                    </div>
                  ) : (
                    websites.map((website, index) => (
                      <div
                        key={website._id?.toString() || `website-${index}`}
                        className='cursor-pointer rounded-lg border bg-white p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-sm'
                        onClick={() => loadWebsite(website)}
                      >
                        <div className='mb-3 flex items-start justify-between'>
                          <div className='min-w-0 flex-1'>
                            <h3 className='truncate font-medium text-gray-900'>
                              {website.title}
                            </h3>
                            <p className='mt-1 flex items-center gap-1 text-sm text-gray-500'>
                              <Globe className='h-3 w-3' />/{website.slug}
                            </p>
                          </div>
                          <Badge variant='secondary' className='text-xs'>
                            {website.components?.length || 0}
                          </Badge>
                        </div>

                        <div className='flex items-center gap-2'>
                          <Button
                            size='sm'
                            variant='outline'
                            className='h-7 bg-transparent px-2 text-xs'
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`/site/${website.slug}`, '_blank');
                            }}
                          >
                            <Eye className='mr-1 h-3 w-3' />
                            Preview
                          </Button>
                          <Button
                            size='sm'
                            className='h-7 bg-gray-900 px-2 text-xs hover:bg-gray-800'
                            onClick={(e) => {
                              e.stopPropagation();
                              deployWebsite(website._id?.toString() || '');
                            }}
                            title='Deploy to Vercel'
                          >
                            <Rocket className='mr-1 h-3 w-3' />
                            Deploy
                          </Button>
                        </div>

                        {website.deploymentUrl && (
                          <div className='mt-3 border-t pt-3'>
                            <a
                              href={website.deploymentUrl}
                              target='_blank'
                              className='inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline'
                              onClick={(e) => e.stopPropagation()}
                              rel='noreferrer'
                            >
                              <ExternalLink className='h-3 w-3' />
                              Live Site
                            </a>
                            <div className='mt-1 flex items-center gap-2'>
                              <div className='h-2 w-2 rounded-full bg-green-400'></div>
                              <span className='text-xs text-gray-500'>
                                {website.deploymentStatus || 'deployed'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='lg:col-span-8 xl:col-span-9'>
            <Card>
              <CardHeader className='pb-6'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                  <div>
                    <CardTitle className='text-xl'>
                      {currentWebsite.title || 'Untitled Website'}
                    </CardTitle>
                    {currentWebsite.slug && (
                      <p className='mt-1 text-sm text-gray-500'>
                        Preview at: /site/{currentWebsite.slug}
                      </p>
                    )}
                  </div>
                  {currentWebsite.components &&
                    currentWebsite.components.length > 0 && (
                      <Badge variant='outline' className='w-fit'>
                        {currentWebsite.components.length} sections
                      </Badge>
                    )}
                </div>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue='settings' className='w-full'>
                  <TabsList className='grid w-full grid-cols-2'>
                    <TabsTrigger
                      value='settings'
                      className='flex items-center gap-2'
                    >
                      <Settings className='h-4 w-4' />
                      <span className='hidden sm:inline'>Settings</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value='components'
                      className='flex items-center gap-2'
                    >
                      <Layout className='h-4 w-4' />
                      <span className='hidden sm:inline'>Components</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value='settings' className='mt-6 space-y-6'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                      <div className='space-y-2'>
                        <Label htmlFor='title' className='text-sm font-medium'>
                          Website Title
                        </Label>
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

                      <div className='space-y-2'>
                        <Label htmlFor='slug' className='text-sm font-medium'>
                          URL Slug
                        </Label>
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
                          <p className='rounded bg-gray-50 px-3 py-2 text-xs text-gray-500'>
                            Your site will be available at:{' '}
                            <code>/site/{currentWebsite.slug}</code>
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value='components' className='mt-6 space-y-6'>
                    <div className='flex flex-wrap gap-3 rounded-lg border bg-gradient-to-r from-purple-50 to-blue-50 p-4'>
                      <div className='mb-2 flex w-full items-center justify-between'>
                        <p className='text-sm font-medium text-gray-700'>
                          Add Components
                        </p>
                        <Button
                          onClick={() => setShowAiDialog(true)}
                          size='sm'
                          className='bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                        >
                          <Sparkles className='mr-2 h-3 w-3' />
                          Generate with AI
                        </Button>
                      </div>
                      <Button
                        onClick={() => addComponent('hero')}
                        size='sm'
                        variant='outline'
                        className='text-xs'
                      >
                        <User className='mr-2 h-3 w-3' />
                        Hero Section
                      </Button>
                      <Button
                        onClick={() => addComponent('about')}
                        size='sm'
                        variant='outline'
                        className='text-xs'
                      >
                        <User className='mr-2 h-3 w-3' />
                        About Section
                      </Button>
                      <Button
                        onClick={() => addComponent('gallery')}
                        size='sm'
                        variant='outline'
                        className='text-xs'
                      >
                        <ImageIcon className='mr-2 h-3 w-3' />
                        Gallery
                      </Button>
                      <Button
                        onClick={() => addComponent('contact')}
                        size='sm'
                        variant='outline'
                        className='text-xs'
                      >
                        <Mail className='mr-2 h-3 w-3' />
                        Contact Form
                      </Button>
                      <Button
                        onClick={() => addComponent('products')}
                        size='sm'
                        variant='outline'
                        className='text-xs'
                      >
                        <ImageIcon className='mr-2 h-3 w-3' />
                        Products
                      </Button>
                    </div>

                    <div className='max-h-[calc(100vh-400px)] space-y-4 overflow-y-auto'>
                      {currentWebsite.components?.length === 0 ? (
                        <div className='py-12 text-center'>
                          <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100'>
                            <Layout className='h-10 w-10 text-gray-400' />
                          </div>
                          <h3 className='mb-2 text-lg font-medium text-gray-700'>
                            No components yet
                          </h3>
                          <p className='mb-4 text-sm text-gray-500'>
                            Add your first component to start building
                          </p>
                        </div>
                      ) : (
                        currentWebsite.components?.map((component, index) => (
                          <ComponentEditor
                            key={index}
                            component={component}
                            index={index}
                            onUpdate={updateComponent}
                            onRemove={removeComponent}
                          />
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Content Generation Dialog */}
      <AIContentDialog
        open={showAiDialog}
        onOpenChange={setShowAiDialog}
        onGenerate={generateAIContent}
        generating={aiGenerating}
      />
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
  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'hero':
        return <User className='h-4 w-4' />;
      case 'about':
        return <User className='h-4 w-4' />;
      case 'gallery':
        return <ImageIcon className='h-4 w-4' />;
      case 'contact':
        return <Mail className='h-4 w-4' />;
      default:
        return <Layout className='h-4 w-4' />;
    }
  };

  return (
    <Card className='border'>
      <CardHeader className='flex flex-row items-center justify-between pb-4'>
        <div className='flex items-center gap-3'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600'>
            {getComponentIcon(component.type)}
          </div>
          <div>
            <CardTitle className='text-base capitalize'>
              {component.type} Section
            </CardTitle>
            <p className='text-sm text-gray-500'>
              Configure your {component.type} content
            </p>
          </div>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onRemove(index)}
          className='border-red-200 text-red-600 hover:bg-red-50'
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </CardHeader>

      <CardContent className='space-y-4'>
        {(component.type === 'hero' ||
          component.type === 'about' ||
          component.type === 'gallery' ||
          component.type === 'contact' ||
          component.type === 'products') && (
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Title</Label>
            <Input
              value={component.title || ''}
              onChange={(e) => onUpdate(index, { title: e.target.value })}
              placeholder='Section title'
            />
          </div>
        )}

        {component.type === 'hero' && (
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Subtitle</Label>
            <Input
              value={component.subtitle || ''}
              onChange={(e) => onUpdate(index, { subtitle: e.target.value })}
              placeholder='Section subtitle'
            />
          </div>
        )}

        {(component.type === 'about' || component.type === 'contact') && (
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Content</Label>
            <Textarea
              value={component.text || ''}
              onChange={(e) => onUpdate(index, { text: e.target.value })}
              placeholder='Your content here...'
              rows={4}
              className='resize-none'
            />
          </div>
        )}

        {component.type === 'about' && (
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Profile Image</Label>
            <ImageUpload
              value={component.image || ''}
              onChange={(url) => onUpdate(index, { image: url })}
            />
          </div>
        )}

        {component.type === 'gallery' && (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>Add Images</Label>
              <ImageUpload
                value=''
                onChange={(url) => {
                  const currentImages = component.images || [];
                  onUpdate(index, { images: [...currentImages, url] });
                }}
                multiple
              />
            </div>

            {component.images && component.images.length > 0 && (
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Gallery Images</Label>
                <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                  {component.images.map((image, imgIndex) => (
                    <div key={imgIndex} className='group relative'>
                      <img
                        src={image || '/placeholder.svg'}
                        alt=''
                        className='h-20 w-full rounded border object-cover'
                      />
                      <Button
                        size='sm'
                        variant='destructive'
                        className='absolute top-1 right-1 h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100'
                        onClick={() => {
                          const newImages =
                            component.images?.filter(
                              (_, i) => i !== imgIndex
                            ) || [];
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
          </div>
        )}

        {component.type === 'contact' && (
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Email Address</Label>
            <Input
              type='email'
              value={component.email || ''}
              onChange={(e) => onUpdate(index, { email: e.target.value })}
              placeholder='your@email.com'
            />
          </div>
        )}

        {component.type === 'products' && (
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label className='text-sm font-medium'>Products</Label>
              <Button
                size='sm'
                onClick={() => {
                  const currentProducts = component.products || [];
                  const newProduct = {
                    name: 'New Product',
                    description: 'Product description',
                    price: 0,
                    image: '',
                    link: ''
                  };
                  onUpdate(index, {
                    products: [...currentProducts, newProduct]
                  });
                }}
                className='h-7 px-3 text-xs'
              >
                <Plus className='mr-1 h-3 w-3' />
                Add Product
              </Button>
            </div>

            {component.products && component.products.length > 0 ? (
              <div className='space-y-4'>
                {component.products.map((product, productIndex) => (
                  <div
                    key={productIndex}
                    className='space-y-3 rounded-lg border p-4'
                  >
                    <div className='flex items-center justify-between'>
                      <h4 className='text-sm font-medium'>
                        Product {productIndex + 1}
                      </h4>
                      <Button
                        size='sm'
                        variant='outline'
                        className='h-6 w-6 p-0 text-red-600'
                        onClick={() => {
                          const newProducts =
                            component.products?.filter(
                              (_, i) => i !== productIndex
                            ) || [];
                          onUpdate(index, { products: newProducts });
                        }}
                      >
                        ×
                      </Button>
                    </div>

                    <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <Label className='text-xs'>Name</Label>
                        <Input
                          value={product.name || ''}
                          onChange={(e) => {
                            const newProducts = [...(component.products || [])];
                            newProducts[productIndex] = {
                              ...product,
                              name: e.target.value
                            };
                            onUpdate(index, { products: newProducts });
                          }}
                          placeholder='Product name'
                          className='h-8 text-sm'
                        />
                      </div>
                      <div>
                        <Label className='text-xs'>Price ($)</Label>
                        <Input
                          type='number'
                          value={product.price || ''}
                          onChange={(e) => {
                            const newProducts = [...(component.products || [])];
                            newProducts[productIndex] = {
                              ...product,
                              price: parseFloat(e.target.value) || 0
                            };
                            onUpdate(index, { products: newProducts });
                          }}
                          placeholder='0'
                          className='h-8 text-sm'
                        />
                      </div>
                    </div>

                    <div>
                      <Label className='text-xs'>Description</Label>
                      <Textarea
                        value={product.description || ''}
                        onChange={(e) => {
                          const newProducts = [...(component.products || [])];
                          newProducts[productIndex] = {
                            ...product,
                            description: e.target.value
                          };
                          onUpdate(index, { products: newProducts });
                        }}
                        placeholder='Product description'
                        rows={2}
                        className='resize-none text-sm'
                      />
                    </div>

                    <div>
                      <Label className='text-xs'>Product Image</Label>
                      <ImageUpload
                        value={product.image || ''}
                        onChange={(url) => {
                          const newProducts = [...(component.products || [])];
                          newProducts[productIndex] = {
                            ...product,
                            image: url
                          };
                          onUpdate(index, { products: newProducts });
                        }}
                      />
                    </div>

                    <div>
                      <Label className='text-xs'>Buy Link (optional)</Label>
                      <Input
                        value={product.link || ''}
                        onChange={(e) => {
                          const newProducts = [...(component.products || [])];
                          newProducts[productIndex] = {
                            ...product,
                            link: e.target.value
                          };
                          onUpdate(index, { products: newProducts });
                        }}
                        placeholder='https://your-store.com/product'
                        className='h-8 text-sm'
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='rounded-lg border-2 border-dashed border-gray-200 py-8 text-center'>
                <ImageIcon className='mx-auto mb-2 h-8 w-8 text-gray-400' />
                <p className='text-sm text-gray-500'>No products yet</p>
                <p className='text-xs text-gray-400'>
                  Click "Add Product" to get started
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
