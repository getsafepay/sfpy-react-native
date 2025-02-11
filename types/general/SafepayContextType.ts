import { Address } from "./Address";


export type SafepayContextType = {
    tracker: string,
    deviceDataCollectionJWT?: string,
    deviceDataCollectionURL?: string
} & Address;
