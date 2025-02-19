import * as React from 'react';
import DataCollection from './src/components/DataCollection';
import { SafepayContext } from './src/contexts/SafepayContext';
import { SafepayContextType } from './src/types';


function App(): React.JSX.Element {

    const values = {
        clientSecret: "ywbJRgITVcHkyLSUiZSmrHTXe1bhRDAV2xnuJzZ7zUMwUBP26oPInSGh_QgXENCsfwLAXpo8ZA==",
        tracker: "track_732aec2c-db8e-47b2-8725-50f744f861ef",
        deviceDataCollectionJWT: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhMWYzMDUyZS01OWJhLTQ3YjYtODFlZC0xZWQ4MGYzOTVjMDUiLCJpYXQiOjE3Mzk4MDM3NzYsImlzcyI6IjVkZDgzYmYwMGU0MjNkMTQ5OGRjYmFjYSIsImV4cCI6MTczOTgwNzM3NiwiT3JnVW5pdElkIjoiNjI0YmYwNjVjZDhmMTM3MzVkNzYwYzc5IiwiUmVmZXJlbmNlSWQiOiIyZWE1ZTkxNC1jYTkzLTQ4MDEtOWRmNC1iZjkwZWE0ZGRiMzcifQ.Bn4aKbnDp5GgLRMlyA9_yMKfazcpVGNaI3E-JzNI354",
        deviceDataCollectionURL: "https://centinelapistag.cardinalcommerce.com/V1/Cruise/Collect",
        street_1: "St 12",
        street_2: "",
        city: "Islamabad",
        state: "",
        postal_code: "44000",
        country: "PK"
    } as SafepayContextType;

    return (
        <SafepayContext.Provider value={values}>
            <DataCollection />
        </SafepayContext.Provider>
    );
}

export default App;
