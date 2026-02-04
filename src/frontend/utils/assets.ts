export function resolveImagePath(path: string): string {
  if (!path) return '';

  // Detect if we are running under /server09
  // We can check if the current pathname starts with /server09
  const isServer09 = window.location.pathname.startsWith('/server09');

  // Normalize path: ensure it doesn't start with / if we are going to append it to a base
  // OR, if it starts with /, we treat it as absolute to the domain root usually,
  // but here we want it relative to the APP root.

  const cleanPath = path.startsWith('/') ? path.substring(1) : path;

  if (isServer09) {
    return `/server09/${cleanPath}`;
  }

  // Localhost or root deployment
  return `/${cleanPath}`;
}
