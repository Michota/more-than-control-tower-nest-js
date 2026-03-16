import { EntityProps } from "@src/libs/ddd";
import { Address } from "@src/shared/value-objects/address.value-object";
import { Customer } from "@src/shared/value-objects/customer";

interface OrderCustomerProperties {
    firstName: string;
    secondName: string;
    email: string;
    phoneNumber: string;
    address: Address;
}

export class OrderCustomer extends Customer {
    firstName: string;
    secondName: string;
    email: string;
    phoneNumber: string;
    address: Address;

    constructor(props: EntityProps<OrderCustomerProperties>) {
        super(props);

        this.firstName = props.properties.firstName;
        this.secondName = props.properties.secondName;
        this.email = props.properties.email;
        this.phoneNumber = props.properties.phoneNumber;
        this.address = props.properties.address;
    }
}
