export type PaymentsSessionSetupApiResponse = {
    data: {
        tracker: {
            token: string,
            client: string,
            environment: string,
            state: string,
            intent: string,
            mode: string,
            entry_mode: string,
            next_actions: {
                CYBERSOURCE: {
                    kind: string 
                },
                MPGS: {
                    kind: string
                }
            },
            purchase_totals: {
                quote_amount: {
                    currency: string,
                    amount: number
                },
                base_amount: {
                    currency: string,
                    amount: number
                },
                conversion_rate: {
                    base_currency: string,
                    quote_currency: string,
                    rate: number
                }
            },
            metadata: {}
        },
        capabilities: {
            CYBERSOURCE: boolean,
            MPGS: boolean
        }
    },
    status: {
        errors: any[],
        message: string
    }
};