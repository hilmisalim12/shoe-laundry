const ICON_MAP: Record<string, string> = {
  'standard clean': 'water-outline',
  'deep clean': 'brush-outline',
  'premium restore': 'diamond-outline',
  'express clean': 'flash-outline',
  'sole repair': 'construct-outline',
};

export function getServiceIcon(serviceName: string): string {
  const key = serviceName.toLowerCase();
  for (const [match, icon] of Object.entries(ICON_MAP)) {
    if (key.includes(match.split(' ')[0]!) || key.includes(match)) return icon;
  }
  return 'footsteps-outline';
}

export function getServiceAccent(serviceName: string): string {
  const key = serviceName.toLowerCase();
  if (key.includes('express')) return '#FEF3C7';
  if (key.includes('premium')) return '#EDE9FE';
  if (key.includes('repair')) return '#FEE2E2';
  if (key.includes('deep')) return '#DBEAFE';
  return '#CCFBF1';
}
