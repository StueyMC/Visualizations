const CopyPlugin = require('copy-webpack-plugin');
const VersionFile = require('webpack-version-file-plugin'); // Used to write package version number into visualization config
const { VueLoaderPlugin } = require('vue-loader')
const HtmlPlugin = require('html-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const path = require('path');
const outputPath = path.join(__dirname, 'dist');
const fs = require('fs');
const ejs = require('ejs');

module.exports = {
    module: {
        rules: [
            // {
            //   test: /\.vue$/,
            //   loader: 'vue-loader',
            //   include: [ path.resolve(__dirname, 'src') ] // helpers.root('src') ]
            // },
            { test: /\.vue$/, loader: 'vue-loader',
              options: {
                loaders: {
                  ts: 'ts-loader',
                  tsx: 'babel-loader!ts-loader',
                }
              }
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                // loader: 'babel-loader!ts-loader',
                // options: {
                //   appendTsxSuffixTo: [/\.vue$/]
                // }

                use: [{
                    loader: 'babel-loader',
                    options: {
                        // presets: [
                        //     "@babel/react", 
                        //     "@babel/typescript",
                        //     [
                        //         '@babel/preset-env',
                        //         {
                        //             useBuiltIns: 'usage',
                        //             corejs: '3.19',
                        //             forceAllTransforms: false,
                        //             targets: {
                        //                 chrome: 34,
                        //                 ie: 11,
                        //                 edge: 20,
                        //                 firefox: 30,
                        //             },
                        //             modules: false
                        //         }
                        //     ]
                        // ],
                        plugins: [
                            "@babel/plugin-syntax-dynamic-import",
                            "@vue/babel-plugin-jsx"
                          ]
                    }
                },
                {
                  loader: 'ts-loader',
                  options: {
                    appendTsxSuffixTo: [/\.vue$/],
                    transpileOnly: true // From https://github.com/babel/babel-loader/issues/912
                  }
                }
              ]
            },            
            {
                test: /\.js$/,
                use: ["source-map-loader"], // ["babel-loader"],
                enforce: "pre",
            },
            {
              test: /\.ts$/,
              loader: 'ts-loader',
              options: {
                appendTsxSuffixTo: [/\.vue$/],
                compilerOptions: {noEmit: false, allowImportingTsExtensions: false}
               }
            }
                ],
    },
    resolve: {
        alias: {
          '@': path.resolve(__dirname, 'src') // helpers.root('src')
        },
        plugins: getResolvers(),
        extensions: [".tsx", ".ts", ".js", ".vue"],
    },
    entry: fs.readdirSync(path.join(__dirname, 'src'))
        .filter(d => fs.lstatSync(path.join(__dirname, 'src', d)).isDirectory())
        .filter(d => fs.readdirSync(path.join(__dirname, 'src', d)).find(d => d === 'visualization.config.json.ejs'))
        .reduce(function (prev, current) {
          const ejsTemplate = fs.readFileSync('./src/' + current + '/visualization.config.json.ejs').toString()
          const configText = ejs.render(ejsTemplate, {package: {version: "1"}})
          const config = JSON.parse(configText)
          prev[current] = path.join(
                __dirname,
                'src',
                current,
                config.webpackEntry
          );
          return prev;
        }, {}),
    output: {
        filename: '[name]/visualization.js',
        path: outputPath,
        environment: {
            arrowFunction: false,
            bigIntLiteral: false,
            const: false,
            destructuring: false,
            dynamicImport: false,
            forOf: false,
            module: false
        },
        //libraryTarget: "var",
        library: 'vis',
        hashFunction: "sha256"
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                "vue" : {
                    test: /[\\/]node_modules[\\/](@vue.*)[\\/]/,
                    name: 'vue',
                    chunks: 'all',
                    priority: 1,
                    enforce: true
                },
                "other" : {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'other',
                    chunks: 'all',
                    priority: -10,
                    enforce: true
                }
            }
        }
    },
    plugins: getPlugins()
};

function getPlugins() {
    class VisualizationDirectory
    {
        constructor(dirName) {
            this.directoryName = dirName;

            this.ejsFiles = fs.readdirSync(path.join(__dirname, 'src', dirName))
                            .filter(f => path.extname(f) === '.ejs');
        }
        containsEJS() {
            return this.ejsFiles.length > 0
        }
        imageFiles() {
            return fs.readdirSync(
                        path.join(__dirname,
                        'src',
                        this.directoryName))
                    .filter(f => path.extname(f) == '.png');
                }
        cssFiles() {
            return fs.readdirSync(
                        path.join(__dirname,
                        'src',
                        this.directoryName))
                    .filter(f => path.extname(f) == '.css');
                }
        configFiles() {
            return [
                'visualization.datashape.gql'
            ]
        }
    }

    let VisualizationDirectories = fs.readdirSync(path.join(__dirname, 'src'))
        .filter(d => fs.lstatSync(path.join(__dirname, 'src', d)).isDirectory())
        .map(d => new VisualizationDirectory(d));
//
// VersionFile for visualization package configuration
//
  let vpcVersionFile = Object(new VersionFile({
    packageFile: 'package.json',
    template: path.join('src', 'package.json.ejs'),
    outputFile: 'package.json'
  }));
//
//  VersionFiles for each visualization configuration
//
  let vcVersionFiles = VisualizationDirectories
    .filter(d => d.containsEJS() === true)
    .map(d => Object(new VersionFile({
      packageFile: 'package.json',
      template: path.join('src', d.directoryName, 'visualization.config.json.ejs'),
      outputFile: path.join(d.directoryName, 'visualization.config.json')
    })));
//
// Define array for CopyPlugin configuration
//
    let copyPatterns = []
//
// CopyPlugin for each visualization configuration
//
    VisualizationDirectories
        .filter(d => d.containsEJS() === true)
        .map(d => d.configFiles().forEach(f => copyPatterns.push(getCopyPluginOption(d.directoryName, f))))
//
// CopyPlugin for each visualization image file
//
    VisualizationDirectories
        .map(d => d.imageFiles().forEach(f => copyPatterns.push(getCopyPluginOption(d.directoryName, f))))
//
// CopyPlugin for each CSS file
//
    VisualizationDirectories
        .map(d => d.cssFiles().forEach(f => copyPatterns.push(getCopyPluginOption(d.directoryName, f))))

let copyPlugins = Object(new CopyPlugin({
    patterns: copyPatterns
}))

const vueLoader = new VueLoaderPlugin()
// const htmlPlugin = new HtmlPlugin({
//   template: 'index.html',
//   chunksSortMode: 'dependency'
// })

return [vueLoader, /*htmlPlugin,*/ vpcVersionFile, copyPlugins].concat(vcVersionFiles);
}

function getResolvers() {
  //
  // tsconfig-paths-webpack-plugin for each visualization project file
  //
  return fs.readdirSync(path.join(__dirname, 'src'))
        .filter(d => fs.lstatSync(path.join(__dirname, 'src', d)).isDirectory())
        .map(d => new TsconfigPathsPlugin({ configFile: path.join(__dirname, 'src', d, "tsconfig.json")}));
}

/**
 * 
 * @param {string} directoryName - name of sub-directory containing file or empty
 * @param {string} fileName - name of file
 */
function getCopyPluginOption(directoryName, fileName)
{
    return {
        context: __dirname,
        from: path.join('src', directoryName, fileName),
        to: path.join(directoryName, fileName)
    };
}
