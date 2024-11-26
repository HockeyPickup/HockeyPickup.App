import md5 from 'md5';

interface AvatarOptions {
  size?: number;
  fallbackType?: 'initials' | 'default-image';
}

export class AvatarService {
  private static readonly DEFAULT_SIZE = 40;
  private static readonly DEFAULT_IMAGE = '/static/Hanson.jpg';

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

    // Try Libravatar first
    const libravatarUrl = this.getLibravatarUrl(email, size);
    if (await this.imageExists(libravatarUrl)) {
      return libravatarUrl;
    }

    // Fall back to Gravatar
    const gravatarUrl = this.getGravatarUrl(email, size);
    if (await this.imageExists(gravatarUrl)) {
      return gravatarUrl;
    }

    // Fall back to UI Avatars if we have a name
    if (name && options.fallbackType === 'initials') {
      return this.getUIAvatarUrl(name, size);
    }

    // Final fallback to default image
    return this.DEFAULT_IMAGE;
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
      return response.ok;
    } catch {
      return false;
    }
  }
}
