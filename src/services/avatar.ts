export class AvatarService {
  private static readonly DEFAULT_IMAGE = '/static/Hanson.jpg';

  static async getAvatarUrl(photoUrl: string = ''): Promise<string> {
    // Return custom upload if it exists
    if (photoUrl && (await this.imageExists(photoUrl))) {
      return photoUrl;
    }

    // Fall back to default image
    return this.DEFAULT_IMAGE;
  }

  private static async imageExists(url: string): Promise<boolean> {
    if (!url) return false;
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Error checking image existence:', error);
      return false;
    }
  }
}
