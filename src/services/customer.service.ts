import * as customerRepository from '../repositories/customer.repository';
import { CustomerData } from '../repositories/customer.repository';

export const getCustomer = async (nit: string) => {
  return await customerRepository.findByNit(nit);
};

export const createCustomer = async (data: CustomerData) => {
  const existingCustomer = await customerRepository.findByNit(data.nit);
  
  if (existingCustomer) {
    throw new Error('DUPLICATE_NIT');
  }

  return await customerRepository.create(data);
};