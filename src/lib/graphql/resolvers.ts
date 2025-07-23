import Product from '../../models/Product';
import User from '../../models/User';
import connectDB from '../mongodb';
import { cleanupProductsWithoutCreatedBy } from '../database-cleanup';
import { seedDatabase } from '../seed';

// Helper function to safely map product data
const mapProductData = (product: any) => ({
  id: product._id.toString(),
  title: product.title || '',
  description: product.description || '',
  price: product.price || 0,
  image: product.image || '',
  definition: product.definition || [],
  type: product.type || 'mains',
  isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
  createdAt: product.createdAt.toISOString(),
  updatedAt: product.updatedAt.toISOString(),
  createdBy: product.createdBy || {
    id: 'unknown',
    name: 'Unknown User',
    email: 'unknown@example.com'
  }
});

export const resolvers = {
  Query: {
    // Get all products (available to all users)
    products: async (_: any, { input }: { input?: any }) => {
      console.log('Products query called with input:', input);
      try {
        await connectDB();

        // Seed database if empty
        await seedDatabase();

        let query: any = { isAvailable: true };

        // Filter by type if provided
        if (input?.type) {
          query.type = input.type;
        }

        // Filter by definition tags if provided
        if (input?.definitions && input.definitions.length > 0) {
          query.definition = { $in: input.definitions };
        }

        // Filter by price range if provided
        if (input?.priceRange) {
          const hasMin =
            input.priceRange.min !== undefined && input.priceRange.min !== null;
          const hasMax =
            input.priceRange.max !== undefined && input.priceRange.max !== null;

          if (hasMin || hasMax) {
            query.price = {};
            if (hasMin) {
              query.price.$gte = Number(input.priceRange.min);
            }
            if (hasMax) {
              query.price.$lte = Number(input.priceRange.max);
            }
          }
        }

        const products = await Product.find(query)
          .populate('createdBy', 'name email')
          .sort({ createdAt: -1 });

        // Filter out products without valid createdBy references
        const validProducts = products.filter((product) => product.createdBy);
        return validProducts.map(mapProductData);
      } catch (error) {
        console.error('Products query error:', error);
        throw error;
      }
    },

    // Get single product by ID
    product: async (_: any, { id }: { id: string }) => {
      console.log('Product query called with id:', id);
      try {
        await connectDB();

        // Validate the ID format
        if (!id || id.trim() === '' || id === 'new') {
          throw new Error('Invalid product ID provided');
        }

        // Check if it's a valid MongoDB ObjectId format
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
          throw new Error('Invalid product ID format');
        }

        const product = await Product.findById(id).populate(
          'createdBy',
          'name email'
        );

        if (!product) {
          throw new Error('Product not found');
        }

        if (!product.createdBy) {
          throw new Error('Product has invalid creator reference');
        }

        return mapProductData(product);
      } catch (error) {
        console.error('Product query error:', error);
        throw error;
      }
    },

    // Get all products including unavailable ones
    allProducts: async () => {
      try {
        await connectDB();

        // Seed database if empty
        await seedDatabase();

        // Clean up any products without valid createdBy references
        await cleanupProductsWithoutCreatedBy();

        const products = await Product.find({})
          .populate('createdBy', 'name email')
          .sort({ createdAt: -1 });

        // Filter out products without valid createdBy references
        const validProducts = products.filter((product) => product.createdBy);
        return validProducts.map(mapProductData);
      } catch (error) {
        console.error('AllProducts query error:', error);
        throw error;
      }
    }
  },

  Mutation: {
    // Create new product
    createProduct: async (_: any, { input }: { input: any }) => {
      console.log('CreateProduct mutation called with input:', input);
      try {
        await connectDB();

        // Seed database if empty
        await seedDatabase();

        // Find or create user
        let userId = input.createdBy;
        if (!userId) {
          // Find the default user or create one
          let defaultUser = await User.findOne({
            email: 'default@example.com'
          });
          if (!defaultUser) {
            defaultUser = new User({
              name: 'Default User',
              email: 'default@example.com',
              clerkId: 'default-user-id'
            });
            await defaultUser.save();
          }
          userId = defaultUser._id;
        }

        const productData = {
          ...input,
          createdBy: userId
        };

        console.log('Product data to save:', productData);
        const product = new Product(productData);
        await product.save();

        const populatedProduct = await Product.findById(product._id).populate(
          'createdBy',
          'name email'
        );

        if (!populatedProduct.createdBy) {
          throw new Error('Failed to create product with valid creator');
        }

        console.log('Product created:', product._id);
        return mapProductData(populatedProduct);
      } catch (error) {
        console.error('CreateProduct error:', error);
        throw error;
      }
    },

    // Update existing product
    updateProduct: async (
      _: any,
      { id, input }: { id: string; input: any }
    ) => {
      console.log(
        'UpdateProduct mutation called with id:',
        id,
        'input:',
        input
      );
      try {
        await connectDB();

        // Validate the ID format
        if (!id || id.trim() === '' || id === 'new') {
          throw new Error('Invalid product ID provided');
        }

        // Check if it's a valid MongoDB ObjectId format
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
          throw new Error('Invalid product ID format');
        }

        const product = await Product.findByIdAndUpdate(
          id,
          { ...input, updatedAt: new Date() },
          { new: true, runValidators: true }
        ).populate('createdBy', 'name email');

        if (!product) {
          throw new Error('Product not found');
        }

        console.log('Product updated:', product._id);
        return mapProductData(product);
      } catch (error) {
        console.error('UpdateProduct error:', error);
        throw error;
      }
    },

    // Delete product
    deleteProduct: async (_: any, { id }: { id: string }) => {
      console.log('DeleteProduct mutation called with id:', id);
      try {
        await connectDB();

        // Validate the ID format
        if (!id || id.trim() === '' || id === 'new') {
          throw new Error('Invalid product ID provided');
        }

        // Check if it's a valid MongoDB ObjectId format
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
          throw new Error('Invalid product ID format');
        }

        const product = await Product.findByIdAndDelete(id);
        if (!product) {
          throw new Error('Product not found');
        }

        console.log('Product deleted:', product._id);
        return true;
      } catch (error) {
        console.error('DeleteProduct error:', error);
        throw error;
      }
    },

    // Toggle product availability
    toggleProductAvailability: async (_: any, { id }: { id: string }) => {
      console.log('ToggleProductAvailability mutation called with id:', id);
      try {
        await connectDB();

        // Validate the ID format
        if (!id || id.trim() === '' || id === 'new') {
          throw new Error('Invalid product ID provided');
        }

        // Check if it's a valid MongoDB ObjectId format
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
          throw new Error('Invalid product ID format');
        }

        const product = await Product.findById(id);
        if (!product) {
          throw new Error('Product not found');
        }

        product.isAvailable = !product.isAvailable;
        product.updatedAt = new Date();
        await product.save();

        const populatedProduct = await Product.findById(product._id).populate(
          'createdBy',
          'name email'
        );

        console.log(
          'Product availability toggled:',
          product._id,
          'isAvailable:',
          product.isAvailable
        );
        return mapProductData(populatedProduct);
      } catch (error) {
        console.error('ToggleProductAvailability error:', error);
        throw error;
      }
    }
  }
};
