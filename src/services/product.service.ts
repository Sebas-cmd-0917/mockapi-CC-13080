import * as productRepository from '../repositories/product.repository';
import { ProductData } from '../repositories/product.repository';

export const listProducts = async () => {
  return await productRepository.findAll();
};

export const getProduct = async (code: string) => {
  return await productRepository.findByCode(code);
};

export const createProduct = async (data: ProductData) => {
  const existing = await productRepository.findByCode(data.code);
  if (existing) throw new Error('DUPLICATE_CODE');

  return await productRepository.create(data);
};
