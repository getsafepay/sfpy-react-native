import * as React from 'react';
import {
    SafeAreaView,
    useColorScheme
} from 'react-native';
import {
    Colors
} from 'react-native/Libraries/NewAppScreen';
import DataCollection from './components/DataCollection';
import { SafepayContext } from './contexts/SafepayContext';
import { SafepayContextType } from './types';

function App(): React.JSX.Element {
    const isDarkMode = useColorScheme() === 'dark';

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    return (
        <SafeAreaView style={backgroundStyle}>
            <SafepayContext.Provider value={{} as SafepayContextType}>
                <DataCollection />
            </SafepayContext.Provider>
        </SafeAreaView>
    );
}

export default App;
