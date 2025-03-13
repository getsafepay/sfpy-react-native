import { OptionalAddress } from "./OptionalAddress";


type SafepayContextTypeWithoutSetter = {
    tracker: string,
    clientSecret: string,
    deviceDataCollectionJWT: string,
    deviceDataCollectionURL: string,
} & OptionalAddress;

export type SafepayContextType = SafepayContextTypeWithoutSetter & {
    setValues?: (values: SafepayContextTypeWithoutSetter) => void;
};
