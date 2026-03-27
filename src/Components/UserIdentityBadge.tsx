import { Building2, UserRound } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

interface UserIdentityBadgeProps {
  userName?: string | null;
  userEmail?: string | null;
  userImage?: string | null;
  institutionName?: string | null;
  institutionShortName?: string | null;
  institutionLogo?: string | null;
  compact?: boolean;
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return "U";
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

export default function UserIdentityBadge({
  userName,
  userEmail,
  userImage,
  institutionName,
  institutionShortName,
  institutionLogo,
  compact = false,
}: Readonly<UserIdentityBadgeProps>) {
  const normalizedName = (userName ?? "User").trim() || "User";
  const initials = getInitials(normalizedName);
  const displayInstitution =
    (institutionShortName ?? "").trim() || (institutionName ?? "").trim() || null;

  let secondaryContent: ReactNode;

  if (displayInstitution) {
    secondaryContent = (
      <>
        <span className="inline-flex h-4 w-4 items-center justify-center overflow-hidden rounded-sm bg-muted/70">
          {institutionLogo ? (
            <Image
              src={institutionLogo}
              alt={displayInstitution}
              width={16}
              height={16}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <Building2 className="h-3.5 w-3.5" />
          )}
        </span>
        <span className="truncate">{displayInstitution}</span>
      </>
    );
  } else if (userEmail) {
    secondaryContent = (
      <>
        <UserRound className="h-3.5 w-3.5" />
        <span className="truncate">{userEmail}</span>
      </>
    );
  } else {
    secondaryContent = (
      <>
        <UserRound className="h-3.5 w-3.5" />
        <span>Profile</span>
      </>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${compact ? "" : "rounded-2xl border border-border/70 bg-background/70 px-3 py-2"}`}>
      <div className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/60 text-xs font-semibold text-muted-foreground">
        {userImage ? (
          <Image
            src={userImage}
            alt={normalizedName}
            width={40}
            height={40}
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{normalizedName}</p>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">{secondaryContent}</div>
      </div>
    </div>
  );
}
