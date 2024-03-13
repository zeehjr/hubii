export class ShopifyIdConflictError extends Error {
  constructor(shopifyId: string) {
    super(`An order with shopifyId "${shopifyId}" already exists`);
  }
}
