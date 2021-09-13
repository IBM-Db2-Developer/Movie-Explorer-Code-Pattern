const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const sassResourcesLoader = require('craco-sass-resources-loader');

const IS_PROD = process.env.NODE_ENV === 'production';

module.exports = {
  style: {
    css: {
      loaderOptions: (cssLoaderOptions) => {
        const cssConfig = cssLoaderOptions;
        if (cssConfig.modules) {
          cssConfig.modules.localIdentName = IS_PROD ? '[hash:base64]' : '[path][name]__[local]';
          cssConfig.modules.exportLocalsConvention = 'camelCase';
        }
        return cssConfig;
      },
      // loaderOptions: {
      //   modules: {
      //     localIdentName: IS_PROD ? '[hash:base64]' : '[path][name]__[local]',
      //     exportLocalsConvention: 'camelCase',
      //   },
      // },
    },
  },
  plugins: [
    {
      plugin: sassResourcesLoader,
      options: {
        resources: [
          path.resolve('carbonFlags.scss'),
          path.resolve('node_modules', 'carbon-components', 'scss', 'globals', 'scss', '_vars.scss'),
          path.resolve('node_modules', '@carbon', 'type', 'scss', 'type.scss'),
        ],
      },
    },
  ],
};
