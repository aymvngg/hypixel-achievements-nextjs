export function PixelImg({
  src,
  alt,
  width,
  height,
  className,
  title,
  loading = 'lazy',
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  title?: string;
  loading?: 'lazy' | 'eager';
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- pixel art; avoids next/image overhead for tiny icons
    <img
      src={src}
      alt={alt}
      title={title}
      width={width}
      height={height}
      className={className}
      loading={loading}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
