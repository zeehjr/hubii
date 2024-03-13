export class ProductNotFoundError extends Error {
  constructor() {
    super('ProductNotFound');
  }
}
