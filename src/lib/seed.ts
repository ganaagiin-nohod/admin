import connectDB from './mongodb';
import User from '../models/User';
import Product from '../models/Product';

export async function seedDatabase() {
  try {
    await connectDB();

    // Check if we already have users
    const userCount = await User.countDocuments();

    if (userCount === 0) {
      // Create a default user
      const defaultUser = new User({
        name: 'Default User',
        email: 'default@example.com',
        clerkId: 'default-user-id'
      });

      await defaultUser.save();
      console.log('Default user created:', defaultUser._id);

      // Create some sample products
      const sampleProducts = [
        {
          title: 'Classic Burger',
          description: 'Juicy beef patty with lettuce, tomato, and cheese',
          price: 12.99,
          image:
            'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
          definition: ['beef', 'cheese', 'classic'],
          type: 'mains',
          isAvailable: true,
          createdBy: defaultUser._id
        },
        {
          title: 'Caesar Salad',
          description:
            'Fresh romaine lettuce with caesar dressing and croutons',
          price: 8.99,
          image:
            'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
          definition: ['salad', 'healthy', 'vegetarian'],
          type: 'appetizers',
          isAvailable: true,
          createdBy: defaultUser._id
        },
        {
          title: 'Chocolate Cake',
          description: 'Rich chocolate cake with chocolate frosting',
          price: 6.99,
          image:
            'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
          definition: ['chocolate', 'sweet', 'dessert'],
          type: 'desserts',
          isAvailable: true,
          createdBy: defaultUser._id
        }
      ];

      for (const productData of sampleProducts) {
        const product = new Product(productData);
        await product.save();
        console.log('Sample product created:', product.title);
      }
    }

    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
