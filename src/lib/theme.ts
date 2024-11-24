import { createTheme } from '@mantine/core';

export const theme = createTheme({
  fontFamily: 'Inter, sans-serif', // Modern, clean font
  primaryColor: 'blue',
  colors: {
    blue: [
      '#E3F5FE',
      '#C3E8FD',
      '#A4DBFC',
      '#85CEFB',
      '#66C1FA',
      '#61DAFB', // Our primary baby blue
      '#47A3D1',
      '#2D7AA8',
      '#14517F',
      '#002856',
    ],
    purple: [
      '#F4EBFF',
      '#E3D0FF',
      '#D2B5FF',
      '#C19AFF',
      '#B07FFF',
      '#6E3CBC', // Our accent purple
      '#5A2F9F',
      '#462382',
      '#321765',
      '#1F0B48',
    ],
  },
  defaultRadius: 'md',
});
