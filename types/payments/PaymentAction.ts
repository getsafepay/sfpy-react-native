export type PaymentAction =         {
    token: string,
    tracker: string,
    attempt: string,
    kind: string,
    created_at: {
        seconds: number 
    },
    updated_at: {
        seconds: number
    }
};
