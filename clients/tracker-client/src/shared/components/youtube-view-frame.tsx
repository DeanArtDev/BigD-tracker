import { AspectRatio } from '@/shared/ui-kit/ui/aspect-ratio';

interface YoutubeVideoFrameProps {
  readonly token: string;
}

function YoutubeViewFrame({ token }: YoutubeVideoFrameProps) {
  return (
    <AspectRatio ratio={16 / 9}>
      <iframe
        className="h-full w-full rounded-md object-cover"
        src={`https://www.youtube-nocookie.com/embed/${token}?enablejsapi=1&rel=0&modestbranding=1`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; clipboard-write; web-share;"
        allowFullScreen
      />
    </AspectRatio>
  );
}

export { YoutubeViewFrame, type YoutubeVideoFrameProps };
