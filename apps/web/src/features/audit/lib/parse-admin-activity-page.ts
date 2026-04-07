export const DEFAULT_ADMIN_ACTIVITY_PAGE = 1;

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseAdminActivityPage(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const rawValue = getSingleValue(searchParams.page);

  if (!rawValue) {
    return DEFAULT_ADMIN_ACTIVITY_PAGE;
  }

  const parsed = Number.parseInt(rawValue, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_ADMIN_ACTIVITY_PAGE;
  }

  return parsed;
}
