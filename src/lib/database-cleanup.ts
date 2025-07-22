import Product from '../models/Product';
import User from '../models/User';
import connectDB from './mongodb';

export const cleanupProductsWithoutCreatedBy = async () => {
  try {
    await connectDB();

    // Find products with invalid or missing createdBy references
    const productsWithoutValidCreatedBy = await Product.find({
      $or: [
        { createdBy: { $exists: false } },
        { createdBy: null },
        { createdBy: '' }
      ]
    });

    if (productsWithoutValidCreatedBy.length > 0) {
      console.log(
        `Found ${productsWithoutValidCreatedBy.length} products without valid createdBy references`
      );

      // Delete these invalid products
      const result = await Product.deleteMany({
        $or: [
          { createdBy: { $exists: false } },
          { createdBy: null },
          { createdBy: '' }
        ]
      });

      console.log(
        `Cleaned up ${result.deletedCount} products without valid createdBy references`
      );
    }
  } catch (error) {
    console.error('Error during database cleanup:', error);
  }
};
