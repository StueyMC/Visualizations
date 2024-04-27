module.exports = {
	presets: [
		[
			'@babel/preset-env',
			{
				useBuiltIns: 'usage', // adds specific imports for polyfills when they are used in each file.
				modules: false, // preserve ES modules.
				corejs: '3.19', //{ version: 3, proposals: true }, // enable polyfilling of every proposal supported by core-js.
        forceAllTransforms: false,
        targets: {
            chrome: 34,
            ie: 11,
            edge: 20,
            firefox: 30,
        },
			},
		],
    "@babel/preset-typescript"
	],
	plugins: [
//		'@babel/plugin-transform-runtime', // enables the re-use of Babel's injected helper code to save on codesize.
	],
	exclude: [/core-js/],
  // From https://github.com/babel/babel-loader/issues/912
  overrides: [{
    test: /\.d\.ts$/,
    parserOpts: {
    plugins: [["typescript", { "dts": true }]]
    }
  }]
};