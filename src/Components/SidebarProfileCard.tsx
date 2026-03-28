import { Building2, User2 } from "lucide-react";
import Image from "next/image";

type SidebarProfileCardProps = {
  userName?: string | null;
  userImage?: string | null;
  institutionShortName?: string | null;
  institutionLogo?: string | null;
  expanded: boolean;
};

function getInitials(name: string): string {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return "US";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function SidebarProfileCard({
  userName,
  userImage,
  institutionShortName,
  institutionLogo,
  expanded,
}: Readonly<SidebarProfileCardProps>) {
  const normalizedUserName = (userName ?? "User").trim() || "User";
  const normalizedInstitutionShortName = (institutionShortName ?? "Institution").trim() || "Institution";

  if (!expanded) {
    return (
      <div className="mt-3 flex flex-col items-center gap-2 border-t border-border/70 pt-3">
        <span className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-muted/60">
          {userImage ? (
            <Image
              src={userImage}
              alt={normalizedUserName}
              width={36}
              height={36}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[11px] font-semibold text-foreground">{getInitials(normalizedUserName)}</span>
          )}
        </span>

        <span className="inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-md border border-border/70 bg-muted/60">
          {institutionLogo ? (
            <Image
              src={institutionLogo}
              alt={normalizedInstitutionShortName}
              width={28}
              height={28}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </span>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-border/70 bg-background/70 p-2.5">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-muted/60">
          {userImage ? (
            <Image
              src={userImage}
              alt={normalizedUserName}
              width={40}
              height={40}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <User2 className="h-4 w-4 text-muted-foreground" />
          )}
        </span>
        <p className="truncate text-sm font-semibold text-foreground">{normalizedUserName}</p>
      </div>

      <div className="mt-2 flex items-center gap-2 rounded-lg border border-border/70 bg-card/70 px-2 py-1.5">
        <span className="inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-md bg-muted/60">
          {institutionLogo ? (
            <Image
              src={institutionLogo}
              alt={normalizedInstitutionShortName}
              width={24}
              height={24}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </span>
        <p className="truncate text-xs font-medium text-muted-foreground">{normalizedInstitutionShortName}</p>
      </div>
    </div>
  );
}
