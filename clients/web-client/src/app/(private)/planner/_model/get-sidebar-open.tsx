import { cookies } from 'next/headers';
import { SIDEBAR_COOKIE_NAME } from '@/shared/ui-kit';

async function getSidebarOpen() {
  return (await cookies()).get(SIDEBAR_COOKIE_NAME)?.value === 'true';
}

export { getSidebarOpen };
