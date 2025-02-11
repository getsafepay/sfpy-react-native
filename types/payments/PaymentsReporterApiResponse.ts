import { SortBy } from "@/enums";
import { Payment } from "./Payment";

export type PaymentsReporterApiResponse = {
    ok: boolean,
    data: {
        count: number,
        list: Payment[],
        meta: {
            offset: number,
            limit: number,
            sort_by: string,
            direction: SortBy 
        }
    }
};
