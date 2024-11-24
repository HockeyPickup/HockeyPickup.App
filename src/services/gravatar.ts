import md5 from 'md5';

export const getGravatarUrl = (email: string, size: number = 40): string => {
  if (!email) return '';
  const hash = md5(email.toLowerCase().trim());
  // Add s-maxage and max-age headers to help with caching
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=404&r=g`;
};
