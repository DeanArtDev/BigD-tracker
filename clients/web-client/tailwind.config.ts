// eslint-disable-next-line import/no-anonymous-default-export
export default {
  theme: {
    extend: {
      keyframes: {
        'collapsible-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        'collapsible-up': {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'collapsible-down': 'collapsible-down 180ms ease-out',
        'collapsible-up': 'collapsible-up 180ms ease-out',
      },
    },
  },
};
