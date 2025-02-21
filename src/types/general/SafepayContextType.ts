import { Address } from "./Address";


type SafepayContextTypeWithoutSetter = {
    tracker: string,
    clientSecret: string,
    deviceDataCollectionJWT: string,
    deviceDataCollectionURL: string,
} & Address;

export type SafepayContextType = SafepayContextTypeWithoutSetter & {
    setValues?: (values: SafepayContextTypeWithoutSetter) => void;
};
