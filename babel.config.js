module.exports = {
    presets: ['module:metro-react-native-babel-preset', 'module:react-native-dotenv'],
    plugins: [
        [
            'module-resolver',
            {
                root: ['./'],
                extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
                alias: {
                    "@": "./",
                }
            }
        ],
        ['module:react-native-dotenv', {
            "moduleName": "@env",
            "path": process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
            "blacklist": null,
            "whitelist": null,
            "safe": false,
            "allowUndefined": true
        }]
    ]
};