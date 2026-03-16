import { ValueObject } from "@libs/ddd";

export interface AddressProperties {
    country: string;
    postalCode: string;
    state: string;
    city: string;
    street: string;
    buildingNumber: string;
}

// TODO: improve these types to be more specific, for example we can create a validation for country, state, city, etc...
export class Address extends ValueObject<AddressProperties> {
    get country(): string {
        return this.properties.country;
    }

    get state(): string {
        return this.properties.state;
    }

    get city(): string {
        return this.properties.city;
    }

    get postalCode(): string {
        return this.properties.postalCode;
    }

    get street(): string {
        return this.properties.street;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected validate(properties: AddressProperties): void {}
}
