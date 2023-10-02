module.exports = {
  content: [
    // app content
    `src/**/*.{js,ts,jsx,tsx}`,
    // include packages if not transpiling
    // "../../packages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      zIndex: {
        99999: '99999',
      },
      screens: {
        'desktop-lg': { max: '1600px' },
        desktop: { max: '1440px' },
        ipadpro: { max: '1366px' },
        'ipadpro-sm': { max: '1280px' },
        ipad: { max: '1023px' },
        phone: { max: '767px' },
      },
      colors: {
        'adapter-text': '#f9ce75',
        'adapter-text-dark': '#2e2e2e',
        'adapter-bg-second': '#3a3a3a',

        textHeading: 'var(--title-text)',
        'bkg-primary': 'var(--primary-bg)',
        subTitle: 'var(--sub-title)',
        'bkg-secondary': 'var(--secondary-bg)',
        'bkg-third': 'var(--third-bg)',
        textContent: 'var(--secondary-text)',
      },
      backgroundImage: {},
    },
  },
  plugins: [],
};
