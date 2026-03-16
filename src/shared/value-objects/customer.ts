import { Entity, EntityProps } from "@src/libs/ddd";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CustomerProperties {}

export class Customer extends Entity<CustomerProperties> {
    static create(props: EntityProps<CustomerProperties>): Customer {
        const newCustomer = new Customer(props);
        newCustomer.validate();
        return newCustomer;
    }

    static reconstitute(props: EntityProps<CustomerProperties>): Customer {
        return new Customer(props);
    }

    public validate(): void {}
}
