import md5 from 'md5';

export const getGravatarUrl = (email: string, size: number = 40): string => {
  const hash = md5(email.toLowerCase().trim());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=mp`;
};
