import Image from "next/image";

type AvatarProps = {
  name: string;
  photo?: string;
  size?: "sm" | "md" | "lg" | "xl";
  rounded?: boolean;
};

const sizes: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-10 w-10 text-sm",
  md: "h-14 w-14 text-base",
  lg: "h-20 w-20 text-xl",
  xl: "h-28 w-28 text-2xl",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function bgFromName(name: string) {
  const palette = ["#D9FF00", "#7B92A5", "#536575", "#FFFFFF"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
}

export default function Avatar({
  name,
  photo,
  size = "md",
  rounded = true,
}: AvatarProps) {
  const bg = bgFromName(name);
  const cls = `${sizes[size]} ${
    rounded ? "rounded-full" : "rounded-2xl"
  } overflow-hidden flex items-center justify-center shrink-0 font-medium`;

  if (photo) {
    return (
      <div className={cls} style={{ backgroundColor: bg }}>
        <Image
          src={photo}
          alt={name}
          width={240}
          height={240}
          className="h-full w-full object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={cls}
      style={{ backgroundColor: bg, color: "#151F27" }}
    >
      <span>{initials(name) || "?"}</span>
    </div>
  );
}
