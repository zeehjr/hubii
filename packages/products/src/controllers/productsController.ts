import { Handler } from 'express';
import { ProductsService } from '../services/productsService';
import { UpdateProductInputSchema } from '../validation/updateProductInput';
import { CreateProductInputSchema } from '../validation/createProductInput';
import {
  ListProductsFilter,
  ListProductsFilterSchema,
} from '../validation/listProductsFilterSchema';

// TODO: Add error handling

export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  create: Handler = async (req, res) => {
    const body = CreateProductInputSchema.parse(req.body);

    const newProduct = await this.productsService.create(body);

    return res.status(201).json({ data: newProduct });
  };

  list: Handler = async (req, res) => {
    const filter = ListProductsFilterSchema.parse(req.query);

    const products = await this.productsService.list({ filter });

    return res.json({
      data: products,
    });
  };

  update: Handler = async (req, res) => {
    if (!req.params.id) {
      // It can only happen if our application routes it without an id param
      throw new Error(
        'ProductsController.update must receive product id as a route param.'
      );
    }

    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: `Id must be a valid number`,
      });
    }

    const body = UpdateProductInputSchema.parse(req.body);

    const data = await this.productsService.update(id, body);

    return res.status(200).json({ data });
  };
}
