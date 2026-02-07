const TOTAL_AVATARS = 500;

export function getRandomAvatarId(): string {
  const randomId = Math.floor(Math.random() * TOTAL_AVATARS) + 1;
  return randomId.toString().padStart(3, "0");
}

export function getAvatarUrl(avatarId: string, supabaseUrl: string): string {
  return `${supabaseUrl}/storage/v1/object/public/avatars/v1/${avatarId}.svg`;
}
