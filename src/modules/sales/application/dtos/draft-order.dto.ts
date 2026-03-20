export interface DraftOrderLineDto {
    itemId: string;
    quantity: number;
    priceId?: string;
}

export interface DraftOrderDto {
    customerId: string;
    lines: DraftOrderLineDto[];
    currency: string;
    buyerPriceTypeId?: string;
}
