import { PaymentMode, PaymentState } from "@/enums";

export type Payment = {
    token: string,
    environment: string,
    client: {
        token: string,
        api_key: string,
        name: string,
        email: string
    },
    customer: {
        token: string
    },
    state: PaymentState,
    intent: string,
    mode: PaymentMode,
    currency: string,
    display_amount: number,
    created_at: {
        seconds: number
    }
};
