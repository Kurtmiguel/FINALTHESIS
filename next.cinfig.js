// next.config.js
module.exports = {
    webpack: (config, { isServer }) => {
      config.module.rules.push({
        test: /\.html$/,
        exclude: /node_modules/,
        loader: 'ignore-loader',
      });
  
      return config;
    },
  };
  