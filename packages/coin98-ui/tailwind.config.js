const sharedConfig = require('@coin98t/tailwind-config/tailwind.config.js');

module.exports = {
    // prefix ui lib classes to avoid conflicting with the app
    prefix: 'c98-',
    presets: [sharedConfig],
};
