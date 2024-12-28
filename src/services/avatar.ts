import md5 from 'md5';

interface AvatarOptions {
  size?: number;
  fallbackType?: 'initials' | 'default-image';
  cacheDuration?: number; // Cache duration in milliseconds
}

export class AvatarService {
  private static readonly DEFAULT_SIZE = 40;
  private static readonly DEFAULT_IMAGE = '/static/Hanson.jpg';
  private static readonly DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 day in milliseconds

  /**
   * Get avatar URL with fallback chain:
   * 1. Libravatar
   * 2. Gravatar
   * 3. UI Avatars (generates nice initials-based avatars)
   * 4. Default image
   */
  static async getAvatarUrl(
    email: string = '',
    name: string = '',
    options: AvatarOptions = {},
  ): Promise<string> {
    const size = options.size ?? this.DEFAULT_SIZE;
    const cacheDuration = options.cacheDuration ?? this.DEFAULT_CACHE_DURATION;

    // Check cache first
    const cachedAvatar = this.getCachedAvatar(email, size);
    if (cachedAvatar) {
      console.debug(`Cache hit for ${email} with size ${size}: ${cachedAvatar}`);
      return cachedAvatar;
    }

    // Try Libravatar first
    const libravatarUrl = this.getLibravatarUrl(email, size);
    if (await this.imageExists(libravatarUrl)) {
      this.cacheAvatar(email, size, libravatarUrl, cacheDuration);
      return libravatarUrl;
    }

    // Fall back to Gravatar
    const gravatarUrl = this.getGravatarUrl(email, size);
    if (await this.imageExists(gravatarUrl)) {
      this.cacheAvatar(email, size, gravatarUrl, cacheDuration);
      return gravatarUrl;
    }

    // Fall back to UI Avatars if we have a name
    if (name && options.fallbackType === 'initials') {
      const uiAvatarUrl = this.getUIAvatarUrl(name, size);
      this.cacheAvatar(email, size, uiAvatarUrl, cacheDuration);
      return uiAvatarUrl;
    }

    // Final fallback to default image
    const defaultImage = this.DEFAULT_IMAGE;
    this.cacheAvatar(email, size, defaultImage, cacheDuration);
    console.debug(`Cache set for ${email} with size ${size}: ${defaultImage}`);
    return defaultImage;
  }

  private static getCachedAvatar(email: string, size: number): string | null {
    const cacheKey = this.getCacheKey(email, size);
    const cachedData = localStorage.getItem(cacheKey);
    if (!cachedData) {
      console.debug(`No cache found for ${email} with size ${size}`);
      return null;
    }

    const { url, expiry } = JSON.parse(cachedData);
    if (Date.now() > expiry) {
      console.debug(`Cache expired for ${email} with size ${size}`);
      localStorage.removeItem(cacheKey);
      return null;
    }
    console.debug(`Cache valid for ${email} with size ${size}`);
    return url;
  }

  private static cacheAvatar(email: string, size: number, url: string, duration: number): void {
    const cacheKey = this.getCacheKey(email, size);
    const expiry = Date.now() + duration;
    const cachedData = JSON.stringify({ url, expiry });
    localStorage.setItem(cacheKey, cachedData);
    console.debug(`Cache stored for ${email} with size ${size}: ${url}`);
  }

  private static getCacheKey(email: string, size: number): string {
    return `avatar_${md5(email.toLowerCase().trim())}_${size}`;
  }

  private static getLibravatarUrl(email: string, size: number): string {
    if (!email) return '';
    const hash = md5(email.toLowerCase().trim());
    return `https://seccdn.libravatar.org/avatar/${hash}?s=${size}&d=404`;
  }

  private static getGravatarUrl(email: string, size: number): string {
    if (!email) return '';
    const hash = md5(email.toLowerCase().trim());
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=404&r=g`;
  }

  private static getUIAvatarUrl(name: string, size: number): string {
    const params = new URLSearchParams({
      name: name,
      size: size.toString(),
      background: 'random', // Generates nice random backgrounds
      bold: 'true',
      format: 'svg',
    });
    return `https://ui-avatars.com/api/?${params}`;
  }

  private static async imageExists(url: string): Promise<boolean> {
    if (!url) return false;
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.status === 404) {
        return false;
      }
      return response.ok;
    } catch (error) {
      console.error('Error checking image existence:', error);
      return false;
    }
  }
}
