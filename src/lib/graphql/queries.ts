import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
  query GetProducts($input: ProductFilterInput) {
    products(input: $input) {
      id
      title
      description
      price
      image
      definition
      type
      isAvailable
      createdAt
      updatedAt
      createdBy {
        id
        name
        email
      }
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      title
      description
      price
      image
      definition
      type
      isAvailable
      createdAt
      updatedAt
      createdBy {
        id
        name
        email
      }
    }
  }
`;

export const GET_ALL_PRODUCTS = gql`
  query GetAllProducts {
    allProducts {
      id
      title
      description
      price
      image
      definition
      type
      isAvailable
      createdAt
      updatedAt
      createdBy {
        id
        name
        email
      }
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      id
      title
      description
      price
      image
      definition
      type
      isAvailable
      createdAt
      updatedAt
      createdBy {
        id
        name
        email
      }
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: ProductUpdateInput!) {
    updateProduct(id: $id, input: $input) {
      id
      title
      description
      price
      image
      definition
      type
      isAvailable
      createdAt
      updatedAt
      createdBy {
        id
        name
        email
      }
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

export const TOGGLE_PRODUCT_AVAILABILITY = gql`
  mutation ToggleProductAvailability($id: ID!) {
    toggleProductAvailability(id: $id) {
      id
      title
      description
      price
      image
      definition
      type
      isAvailable
      createdAt
      updatedAt
      createdBy {
        id
        name
        email
      }
    }
  }
`;
