// Product types to ensure consistency across the app
export type ProductType =
  | 'drinks'
  | 'appetizers'
  | 'mains'
  | 'desserts'
  | 'sides';

export const PRODUCT_TYPES: { label: string; value: ProductType }[] = [
  { label: 'Drinks', value: 'drinks' },
  { label: 'Appetizers', value: 'appetizers' },
  { label: 'Main Courses', value: 'mains' },
  { label: 'Desserts', value: 'desserts' },
  { label: 'Sides', value: 'sides' }
];

export interface ProductFormData {
  title: string;
  type: ProductType;
  price: number;
  description: string;
  definition: string[];
  image: File[] | undefined;
}
