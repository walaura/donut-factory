const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
	.BundleAnalyzerPlugin;

module.exports = {
	entry: {
		main: './src/index.ts',
		'game.wk': './src/wk/game.wk.ts',
		'canvas.wk': './src/wk/canvas.wk.ts',
	},
	output: {
		filename: './[name].donut.js',
		path: path.join(__dirname, 'dist'),
	},
	devServer: {
		contentBase: path.join(__dirname, 'static'),
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html',
			chunks: ['main'],
		}),
		//new BundleAnalyzerPlugin(),
	],
	resolve: {
		extensions: ['.ts', '.tsx', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.(png|wav)$/i,
				use: [
					{
						loader: 'file-loader',
					},
				],
			},
			{
				test: /\.(t|j)sx?$/,
				use: [
					{
						loader: 'ts-loader',
						options: { transpileOnly: true, experimentalWatchApi: true },
					},
				],
			},
		],
	},
};
