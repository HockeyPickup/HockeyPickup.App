// Player ratings (Admin/SubAdmin only) are stripped from WebSocket broadcasts server-side, so a
// live session update arrives with every rating zeroed. Admin clients re-apply the ratings they
// already loaded — keyed by user id — so the roster keeps showing them without a refresh. For
// non-admins the loaded ratings are already zero, so this is a no-op (and never exposes data).

// Records id -> rating for every object in the tree that carries both a user id and a real rating.
export const collectRatings = (node: unknown, into: Map<string, number>): void => {
  if (Array.isArray(node)) {
    node.forEach((item) => collectRatings(item, into));
    return;
  }
  if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>;
    const id = obj.UserId ?? obj.Id;
    if (typeof id === 'string' && typeof obj.Rating === 'number' && obj.Rating > 0) {
      into.set(id, obj.Rating);
    }
    Object.values(obj).forEach((value) => collectRatings(value, into));
  }
};

// Re-applies known ratings (by user id) onto every object in the tree that has a rating slot.
// Mutates the tree, so pass a clone (the live subscription payload is frozen).
export const applyRatings = (node: unknown, from: Map<string, number>): void => {
  if (Array.isArray(node)) {
    node.forEach((item) => applyRatings(item, from));
    return;
  }
  if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>;
    const id = obj.UserId ?? obj.Id;
    if (typeof id === 'string' && typeof obj.Rating === 'number' && from.has(id)) {
      obj.Rating = from.get(id) as number;
    }
    Object.values(obj).forEach((value) => applyRatings(value, from));
  }
};
