import { PaymentMode, PaymentState } from "@/enums"
import { PaymentEvent } from "./PaymentEvent"
import { PriceMoney } from "../general"
import { PaymentAttempt } from "./PaymentAttempt"

export type PaymentReporterFinderApiResponse = {
    ok: boolean,
    data: {
        token: string,
        environment: string,
        state: PaymentState,
        intent: string,
        mode: PaymentMode,
        entry_mode: string,
        client: {
            token: string,
            api_key: string,
            name: string,
            email: string
        },
        customer: {
            token: string,
            first_name: string,
            last_name: string,
            email: string,
            phone: string,
            type: number
        },
        next_actions: {
            CYBERSOURCE: {
                kind: string
            },
            MPGS: {
                kind: string
            }
        },
        purchase_totals: {
            quote_amount: PriceMoney,
            base_amount: PriceMoney,
            conversion_rate: {
                base_currency: string,
                quote_currency: string,
                rate: number
            }
        },
        charge: {
            token: string,
            tracker: string,
            client: string,
            user: string,
            amount: PriceMoney,
            fees: PriceMoney,
            tax: PriceMoney,
            net: PriceMoney,
            signature: string,
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
            balance: {
                currency: string,
                amount: number
            },
            created_at: {
                seconds: number
            },
            updated_at: {
                seconds: number
            }
        },
        events: PaymentEvent[],
        attempts: PaymentAttempt[],
        device: {
            tracker: string,
            token: string,
            user_agent: string,
            entity: string,
            browser: string,
            browser_version: string,
            device_type: string,
            platform_icon: string,
            created_at: {
                seconds: number
            },
            updated_at: {
                seconds: number
            }
        },
        created_at: {
            seconds: number
        },
        updated_at: {
            seconds: number
        }
    }
};