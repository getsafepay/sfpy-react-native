export type TrackerAuthenticationResponse = {
    data: {
        tracker: {
            token: string,
            client: string,
            environment: string,
            state: string,
            payment_method_kind: string,
            intent: string,
            mode: string,
            entry_mode: string,
            customer: string,
            next_actions: {
                CYBERSOURCE: {
                    kind: string,
                    request_id: string
                },
                MPGS: {
                    kind: string
                },
                PAYFAST: {
                    kind: string
                }
            },
            purchase_totals: {
                quote_amount: {
                    currency: string
                },
                base_amount: {
                    currency: string
                },
                conversion_rate: {
                    base_currency: string,
                    quote_currency: string,
                    rate: number
                }
            },
            metadata: {},
            authorization: {
                token: string,
                tracker: string,
                attempt: string,
                intent: string,
                cybersource_rid: string,
                totals: {
                    currency: string
                },
                created_at: {
                    seconds: number,
                    nanos: number
                },
                updated_at: {
                    seconds: number,
                    nanos: number
                }
            }
        },
        action: {
            token: string,
            payment_method: {
                token: string,
                pointer: string,
                expiration_month: string,
                expiration_year: string,
                card_type_code: string,
                card_type: string,
                bin_number: string,
                last_four: string
            }
        }
    },
    status: {
        errors: any[],
        message: string
    }
};
