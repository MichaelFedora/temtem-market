module.exports = {
  apps: [
    {
      name: 'temtem-market',
      script: 'build-prod/backend/temtem-market.js',
      watch: true,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
