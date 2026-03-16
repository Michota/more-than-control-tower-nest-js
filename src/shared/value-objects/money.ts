import Decimal from "decimal.js";
import { ValueObject } from "@src/libs/ddd/index.js";
import { Currency } from "./currency.js";

interface MoneyProperties {
    amount: Decimal;
    currency: Currency;
}

export class Money extends ValueObject<MoneyProperties> {
    static readonly ZERO = new Money(new Decimal(0), new Currency("PLN"));

    validate(props: MoneyProperties): void {
        if (props.amount.isNaN()) {
            throw new Error("Money amount cannot be NaN");
        } else if (!props.amount.isFinite()) {
            throw new Error("Money amount must be finite");
        } else if (props.amount.isNegative()) {
            throw new Error("Money amount cannot be negative");
        } else if (Currency.isCurrency(props.currency)) {
            throw new Error(`Invalid currency: ${props.currency.code}`);
        }
    }

    constructor(amount: Decimal, currency: Currency) {
        super({ amount, currency });
    }

    get amount(): Decimal {
        return this.properties.amount;
    }

    get currency(): Currency {
        return this.properties.currency;
    }

    isSameCurrency(other: Money): boolean {
        return this.currency.code === other.currency.code;
    }

    add(other: Money): Money {
        if (!this.isSameCurrency(other)) {
            throw new Error(`Currency mismatch: cannot add ${other.currency.code} to ${this.currency.code}`);
        }
        return new Money(this.amount.add(other.amount), this.currency);
    }

    subtract(other: Money): Money {
        if (!this.isSameCurrency(other)) {
            throw new Error(`Currency mismatch: cannot subtract ${other.currency.code} from ${this.currency.code}`);
        }
        return new Money(this.amount.sub(other.amount), this.currency);
    }
}
