import { PriceMoney } from "../general";

export type PaymentEvent = {
    intent: string,
    type: string,
    intent_request_id: string,
    reason: string,
    purchase_totals: PriceMoney,
    created_at: {
        seconds: number
    }
};
