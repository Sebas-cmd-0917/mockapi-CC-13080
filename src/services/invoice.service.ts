import * as invoiceRepository from '../repositories/invoice.repository';
import * as itemRepository from '../repositories/item.repository';
import * as customerRepository from '../repositories/customer.repository';

export interface InvoiceItemInput {
  item_code: string;
  quantity: number;
}

export interface CreateInvoiceInput {
  number: string;
  customer_nit: string;
  items: InvoiceItemInput[];
}

// Error class that carries structured validation details
class ValidationError extends Error {
  constructor(public readonly details: string[]) {
    super('VALIDATION_ERROR');
  }
}

export const createInvoice = async (input: CreateInvoiceInput) => {
  const errors: string[] = [];

  // Parallel lookups: customer existence + duplicate invoice number
  const [customer, existingInvoice] = await Promise.all([
    customerRepository.findByNit(input.customer_nit),
    invoiceRepository.findByNumber(input.number),
  ]);

  if (!customer) errors.push('Customer not found');
  if (existingInvoice) errors.push(`Invoice number '${input.number}' already exists`);

  // Validate all items exist in a single batch query
  const codes = input.items.map((i) => i.item_code);
  const foundItems = await itemRepository.findManyByCodes(codes);
  const foundCodeSet = new Set(foundItems.map((i) => i.code));

  const missingCodes = codes.filter((c) => !foundCodeSet.has(c));
  if (missingCodes.length > 0) {
    errors.push(`Items not found: ${missingCodes.join(', ')}`);
  }

  // Validate quantity > 0 (Zod already enforces this, but service is the source of truth)
  const badQuantities = input.items.filter((i) => i.quantity <= 0);
  if (badQuantities.length > 0) {
    errors.push(`Invalid quantity (<= 0) for items: ${badQuantities.map((i) => i.item_code).join(', ')}`);
  }

  if (errors.length > 0) throw new ValidationError(errors);

  // Build a map for O(1) price lookups
  const itemPriceMap = new Map(foundItems.map((i) => [i.code, Number(i.price)]));

  // Bug 2 fix: validate price > 0 from DB (Zod only validates input, not stored data)
  const itemsWithInvalidPrice = foundItems
    .filter((i) => Number(i.price) <= 0)
    .map((i) => i.code);
  if (itemsWithInvalidPrice.length > 0) {
    throw new ValidationError([
      `Items with invalid price (<= 0) in database: ${itemsWithInvalidPrice.join(', ')}`,
    ]);
  }

  // Calculate total from DB-authoritative prices — never from the request body
  let total = 0;
  const lineItems = input.items.map((inputItem) => {
    // Bug 3 fix: explicit error instead of silencing with ?? 0
    const price = itemPriceMap.get(inputItem.item_code);
    if (price === undefined) throw new Error(`Price not found for item: ${inputItem.item_code}`);
    total += price * inputItem.quantity;
    return { item_code: inputItem.item_code, quantity: inputItem.quantity, price };
  });

  // Round to 2 decimal places to avoid floating-point drift
  total = Math.round(total * 100) / 100;

  return invoiceRepository.createWithItems(
    { number: input.number, customer_nit: input.customer_nit, total, status: 'approved' },
    lineItems
  );
};
