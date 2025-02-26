import Image from "next/image";

export default function Logo({ width = 100, height = 50 }) {
  return (
    <Image 
      src="/coolfi.png" 
      alt="Company Logo"
      width={width} 
      height={height}
      priority // Loads the image faster (useful for logos)
    />
  );
}
