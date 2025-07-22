export const typeDefs = `
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Product {
    id: ID!
    title: String!
    description: String!
    price: Float!
    image: String!
    definition: [String!]!
    type: ProductType!
    isAvailable: Boolean!
    createdAt: String!
    updatedAt: String!
    createdBy: User!
  }

  enum ProductType {
    drinks
    appetizers
    mains
    desserts
    sides
  }

  input ProductInput {
    title: String!
    description: String!
    price: Float!
    image: String!
    definition: [String!]!
    type: ProductType!
    isAvailable: Boolean
    createdBy: ID
  }

  input ProductUpdateInput {
    title: String
    description: String
    price: Float
    image: String
    definition: [String!]
    type: ProductType
    isAvailable: Boolean
  }

  input PriceRangeInput {
    min: Float
    max: Float
  }

  input ProductFilterInput {
    type: ProductType
    definitions: [String!]
    priceRange: PriceRangeInput
  }

  type Query {
    products(input: ProductFilterInput): [Product!]!
    product(id: ID!): Product
    allProducts: [Product!]!
  }

  type Mutation {
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductUpdateInput!): Product!
    deleteProduct(id: ID!): Boolean!
    toggleProductAvailability(id: ID!): Product!
  }
`;
