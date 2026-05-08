import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  name: string;
  photoURL?: string | null;
  size?: "sm" | "md" | "lg";
  isOnline?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

const dotMap = {
  sm: "w-2 h-2 border",
  md: "w-2.5 h-2.5 border-[1.5px]",
  lg: "w-3 h-3 border-2",
};

export function Avatar({ name, photoURL, size = "md", isOnline, className }: AvatarProps) {
  const initials = getInitials(name);
  const sizeClass = sizeMap[size];
  const dotClass = dotMap[size];

  // Generate a consistent color based on name
  const colors = [
    "bg-rose-500", "bg-orange-500", "bg-amber-500", "bg-emerald-500",
    "bg-teal-500", "bg-cyan-500", "bg-blue-500", "bg-violet-500",
    "bg-purple-500", "bg-pink-500",
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div className={cn("relative flex-shrink-0", className)}>
      <div className={cn("rounded-full flex items-center justify-center overflow-hidden", sizeClass, bgColor)}>
        {photoURL ? (
          <Image src={photoURL} alt={name} fill className="object-cover" />
        ) : (
          <span className="font-semibold text-white">{initials}</span>
        )}
      </div>
      {isOnline !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-[--bg]",
            dotClass,
            isOnline ? "bg-brand-400" : "bg-zinc-400"
          )}
        />
      )}
    </div>
  );
}
