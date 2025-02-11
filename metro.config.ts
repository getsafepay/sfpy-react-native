import { getDefaultConfig } from '@react-native/metro-config';
import path from 'path';

const defaultConfig = getDefaultConfig(path.resolve(__dirname));

const config = {
    ...defaultConfig,
    resolver: {
        ...defaultConfig.resolver,
        extraNodeModules: {
            '@': path.resolve(__dirname, '.'),
        },
        sourceExts: [...defaultConfig.resolver.sourceExts, 'ts', 'tsx'],
    },
};

export default config;
