import Safepay from "@sfpy/node-core";

export type OnSafepayErrorData = {
    error: Safepay.errors.SafepayError
};
