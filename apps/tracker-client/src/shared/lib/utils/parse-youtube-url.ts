function parseYoutubeUrl(url: string): { token: string | undefined } {
  const searchParams = new URL(url);
  if (url.startsWith('https://www.youtube.com/')) {
    return { token: searchParams.searchParams.get('v') ?? undefined };
  }
  if (url.startsWith('https://youtu.be/')) {
    const pathname = new URL(url).pathname;
    return { token: pathname === '/' ? undefined : pathname.slice(1, pathname.length) };
  }

  return { token: undefined };
}
export { parseYoutubeUrl };
