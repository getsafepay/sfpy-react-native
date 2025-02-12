import * as React from 'react';
import {
    useColorScheme
} from 'react-native';
import {
    Colors
} from 'react-native/Libraries/NewAppScreen';
import DataCollection from './components/DataCollection';


function App(): React.JSX.Element {
    const isDarkMode = useColorScheme() === 'dark';

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    return (
        <DataCollection />
    );
}

export default App;
