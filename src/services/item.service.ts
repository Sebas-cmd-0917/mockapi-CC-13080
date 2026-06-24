import * as itemRepository from '../repositories/item.repository';
import { ItemData } from '../repositories/item.repository';

export const getItem = async (code: string) => {
  return await itemRepository.findByCode(code);
};

export const createItem = async (data: ItemData) => {
  const existing = await itemRepository.findByCode(data.code);
  if (existing) throw new Error('DUPLICATE_CODE');

  return await itemRepository.create(data);
};
