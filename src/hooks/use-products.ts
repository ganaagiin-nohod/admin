import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import {
  GET_PRODUCTS,
  GET_PRODUCT,
  GET_ALL_PRODUCTS,
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  TOGGLE_PRODUCT_AVAILABILITY
} from '@/lib/graphql/queries';

export function useProducts(filters?: any) {
  return useQuery(GET_PRODUCTS, {
    variables: { input: filters },
    errorPolicy: 'all'
  });
}

export function useProduct(id: string) {
  return useQuery(GET_PRODUCT, {
    variables: { id },
    errorPolicy: 'all',
    skip: !id || id.trim() === '' || id === 'new'
  });
}

export function useAllProducts() {
  return useQuery(GET_ALL_PRODUCTS, {
    errorPolicy: 'all'
  });
}

export function useCreateProduct() {
  const client = useApolloClient();

  return useMutation(CREATE_PRODUCT, {
    onCompleted: () => {
      client.refetchQueries({
        include: [GET_PRODUCTS, GET_ALL_PRODUCTS]
      });
    }
  });
}

export function useUpdateProduct() {
  const client = useApolloClient();

  return useMutation(UPDATE_PRODUCT, {
    onCompleted: () => {
      client.refetchQueries({
        include: [GET_PRODUCTS, GET_ALL_PRODUCTS]
      });
    }
  });
}

export function useDeleteProduct() {
  const client = useApolloClient();

  return useMutation(DELETE_PRODUCT, {
    onCompleted: () => {
      client.refetchQueries({
        include: [GET_PRODUCTS, GET_ALL_PRODUCTS]
      });
    }
  });
}

export function useToggleProductAvailability() {
  const client = useApolloClient();

  return useMutation(TOGGLE_PRODUCT_AVAILABILITY, {
    onCompleted: () => {
      client.refetchQueries({
        include: [GET_PRODUCTS, GET_ALL_PRODUCTS]
      });
    }
  });
}
