import Image from "next/image";

type SmartImageProps = {
  src: string;
  alt: string;
  className?: string;
  /**
   * When true, the parent container must be `position: relative` with explicit dimensions.
   * Matches `next/image` usage of the `fill` prop.
   */
  fill?: boolean;
  sizes?: string;
};

export default function SmartImage({ src, alt, className, fill, sizes }: SmartImageProps) {
  const isDataUrl = src.startsWith("data:");

  if (isDataUrl) {
    // `next/image` can be unreliable/inefficient with large data URLs in production.
    // Use a plain <img> for in-DB/base64 uploads.
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={fill ? { width: "100%", height: "100%", objectFit: "cover" } : undefined}
      />
    );
  }

  return <Image src={src} alt={alt} fill={fill} className={className} sizes={sizes} />;
}

