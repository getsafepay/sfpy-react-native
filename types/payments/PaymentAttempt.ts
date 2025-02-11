import { PaymentScheme } from "@/enums";
import { PriceMoney } from "../general"
import { PaymentAction } from "./PaymentAction"

export type PaymentAttempt = 
{
    token: string,
    tracker: string,
    intent: string,
    idempotency_key: string,
    kind: number,
    actions_performed: PaymentAction[],
    payment_method: {
        token: string,
        tracker: string,
        attempt: string,
        pointer: string,
        last_four: number,
        kind: string,
        scheme: PaymentScheme,
        bin: string,
        expiration_month: string,
        expiration_year: string,
        use_card_on_file: boolean,
        created_at: {
            seconds: number
        },
        updated_at: {
            seconds: number
        }
    },
    billing: {
        street_1: string,
        city: string,
        postal_code: string,
        country: string
    },
    risk: {
        token: string,
        attempt: string,
        score: string,
        factor_codes: string[],
        info_codes: string[],
        created_at: {
            seconds: number 
        },
        updated_at: {
            seconds: number
        }
    },
    authorization: {
        token: string,
        tracker: string,
        attempt: string,
        intent: string,
        cybersource_rid: string,
        totals: PriceMoney,
        created_at: {
            seconds: number
        },
        updated_at: {
            seconds: number
        }
    },
    capture: {
        token: string,
        tracker: string,
        attempt: string,
        intent: string,
        cybersource_rid: string,
        is_voidable: boolean,
        kind: string,
        totals: PriceMoney,
        created_at: {
            seconds: number 
        },
        updated_at: {
            seconds: number
        }
    },
    is_success: boolean,
    created_at: {
        seconds: number
    },
    updated_at: {
        seconds: number
    },
    mode: string,
    entry_mode: string,
    customer: {
        token: string,
        first_name: string,
        last_name: string,
        email: string,
        phone: string,
        type: number
    }
};