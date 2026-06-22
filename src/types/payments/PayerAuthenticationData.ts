export type PayerAuthenticationData = {
    tracker: string;
    request_id?: string;
    errorMessage?: string;
};

export type PayerAuthenticationErrorData = PayerAuthenticationData & {
    error: string;
};

export type PayerAuthenticationSuccessData = PayerAuthenticationData & {
    authorization?: string;
    payment_method?: string;
};
