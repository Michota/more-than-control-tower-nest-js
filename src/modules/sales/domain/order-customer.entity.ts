import { EntityProps } from "@src/libs/ddd";
import { EntityWithSchema } from "@src/shared/ddd/entity-with-schema.abstract";
import { Address } from "@src/shared/value-objects/address.value-object";
import z from "zod";

const orderCustomerPropertiesSchema = z.object({
    firstName: z.string(),
    secondName: z.string(),
    address: z.instanceof(Address),
    email: z.email(),
    phoneNumber: z.string(),
});

type OrderCustomerProperties = z.infer<typeof orderCustomerPropertiesSchema>;

export class OrderCustomer extends EntityWithSchema<OrderCustomerProperties> {
    protected schema = orderCustomerPropertiesSchema;

    readonly firstName: string;
    readonly secondName: string;
    readonly address: Address;

    constructor(props: EntityProps<OrderCustomerProperties>) {
        super(props);

        this.firstName = props.properties.firstName;
        this.secondName = props.properties.secondName;
        this.address = props.properties.address;
    }
}
