import { ProductId } from './product-id.js';
import { Money } from './money.js';

export class Product {
    constructor(
        readonly productId: ProductId,
        readonly name: string,
        readonly price: Money,
    ) {}
}
