import { parseYoutubeUrl } from '@/shared/lib/utils/parse-youtube-url';
import { shapeHqdefaultPreviewSrc } from '@/shared/lib/utils/shape-hqdefault-preview-src';
import { useMemo } from 'react';

function useYoutubeUrlParse(url?: string) {
  const { token } = useMemo(() => {
    if (!url) return { token: undefined };
    return parseYoutubeUrl(url);
  }, [url]);

  const previewUrl = useMemo(() => {
    if (url == null || url === '') return undefined;
    return token != null ? shapeHqdefaultPreviewSrc(token) : undefined;
  }, [url, token]);

  return {
    token,
    previewUrl,
  };
}

export { useYoutubeUrlParse };
