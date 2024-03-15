import { Handler } from 'express';
import { ProductsService } from '../services/productsService';
import { UpdateProductInputSchema } from '../validation/updateProductInput';
import { CreateProductInputSchema } from '../validation/createProductInput';
import { IdsListSchema } from '../validation/idsList';

// TODO: Add error handling

export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  create: Handler = async (req, res) => {
    const body = CreateProductInputSchema.parse(req.body);

    const newProduct = await this.productsService.create(body);

    return res.status(201).json({ data: newProduct });
  };

  list: Handler = async (req, res) => {
    const ids = IdsListSchema.parse(req.query.ids);
    const shopifyIds = IdsListSchema.parse(req.query.shopifyIds);

    if (ids && shopifyIds) {
      return res.status(400).json({
        message: `You can't specify ids and shopifyIds at the same time. You have to either pass ids or shopifyIds.`,
      });
    }

    let idsList: string[] = [];

    let filterBy: 'ids' | 'shopifyIds' | 'none' = 'none';

    if (ids) {
      idsList = Array.isArray(ids) ? ids : ids.split(',');
      filterBy = 'ids';
    }

    if (shopifyIds) {
      idsList = Array.isArray(shopifyIds) ? shopifyIds : shopifyIds.split(',');
      filterBy = 'shopifyIds';
    }

    const products = await this.productsService.list(idsList, filterBy);

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
