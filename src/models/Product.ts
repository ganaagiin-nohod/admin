import mongoose from 'mongoose';

export interface IProduct extends mongoose.Document {
  title: string;
  description: string;
  price: number;
  image: string;
  definition: string[];
  type: 'drinks' | 'appetizers' | 'mains' | 'desserts' | 'sides';
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
}

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true,
    trim: true
  },
  definition: {
    type: [String],
    required: true,
    validate: {
      validator: function (array: string[]) {
        return array.length > 0 && array.length <= 10;
      },
      message: 'Definition must have between 1 and 10 descriptive tags'
    }
  },
  type: {
    type: String,
    required: true,
    enum: ['drinks', 'appetizers', 'mains', 'desserts', 'sides']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ProductSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

ProductSchema.index({ type: 1, isAvailable: 1 });
ProductSchema.index({ createdBy: 1 });
ProductSchema.index({ definition: 1 });

export default mongoose.models.Product ||
  mongoose.model<IProduct>('Product', ProductSchema);

export const getProductsByDefinition = async (tags: string[]) => {
  const Product =
    mongoose.models.Product ||
    mongoose.model<IProduct>('Product', ProductSchema);
  return await Product.find({
    definition: { $in: tags },
    isAvailable: true
  }).populate('createdBy', 'name email');
};

export const getProductsByType = async (type: string) => {
  const Product =
    mongoose.models.Product ||
    mongoose.model<IProduct>('Product', ProductSchema);
  return await Product.find({
    type: type,
    isAvailable: true
  }).populate('createdBy', 'name email');
};

export const getRecommendedProducts = async (preferences: {
  types?: string[];
  definitions?: string[];
  priceRange?: { min?: number; max?: number };
}) => {
  const Product =
    mongoose.models.Product ||
    mongoose.model<IProduct>('Product', ProductSchema);
  const query: any = { isAvailable: true };

  if (preferences.types?.length) {
    query.type = { $in: preferences.types };
  }

  if (preferences.definitions?.length) {
    query.definition = { $in: preferences.definitions };
  }

  if (preferences.priceRange) {
    query.price = {};
    if (preferences.priceRange.min !== undefined) {
      query.price.$gte = preferences.priceRange.min;
    }
    if (preferences.priceRange.max !== undefined) {
      query.price.$lte = preferences.priceRange.max;
    }
  }

  return await Product.find(query)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
};
