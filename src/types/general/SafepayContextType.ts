import { Address } from "./Address";


export type SafepayContextType = {
    tracker: string,
    clientSecret: string,
    deviceDataCollectionJWT: string,
    deviceDataCollectionURL: string
} & Address;
