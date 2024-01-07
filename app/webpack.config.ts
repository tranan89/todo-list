// @ts-ignore
import path from 'path';
import { Configuration } from 'webpack';
// @ts-ignore
import CopyWebpackPlugin from 'copy-webpack-plugin';

const env = (process.env.NODE_ENV as 'production' | 'development' | undefined) ?? 'development';
const isProd = env === 'production';

const config: Configuration = {
	devtool: isProd ? 'source-map' : false,
	mode: env,
	entry: './src/bootstrap.tsx',
	resolve: {
		extensions: ['.tsx', '.ts', '.js', '.css'],
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
	},
	module: {
		rules: [
			{
				test: /.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.(css)$/,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							sourceMap: true,
							modules: {
								localIdentName: '[name]_[local]_[contenthash:base64:5]',
							},
							importLoaders: 1,
						},
					},
					'postcss-loader',
				],
				exclude: [/node_modules/],
			},
		],
	},
	plugins: [
		new CopyWebpackPlugin({
			patterns: [{ from: 'static' }],
		}),
	],
};

export default config;
