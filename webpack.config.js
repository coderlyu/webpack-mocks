module.exports = {
    mode: 'development',
    target: 'node',
    entry: './src/app.ts',
    devtool: 'source-map',
    output: {
        clean: true,
        filename: '[name].[hash:8].js'
    }
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node-modules/
            }
        ]
    }
}