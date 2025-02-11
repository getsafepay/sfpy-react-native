import { EnrollmentAuthenticationStatus } from "@/enums";

export type EnrollmentResponse = {
    data: {
        tracker: {
            token: string,
            client: string,
            environment: string,
            state: string,
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
        action: {
            token: string,
            payment_method: {
                token: string,
                expiration_month: string,
                expiration_year: string,
                card_type_code: string,
                card_type: string,
                bin_number: string,
                last_four: string
            },
            payer_authentication_enrollment: {
                rid: string,
                enrollment_status: string,
                veres_enrolled: string,
                veres_enrolled_description: string,
                access_token: string,
                step_up_url: string,
                challenge_window_size: string,
                challenge_window_size_description: string,
                specification_version: string,
                authentication_status: EnrollmentAuthenticationStatus,
                authentication_transaction_id: string 
            }
        }
    },
    status: {
        errors: [],
        message: string
    }
};
