import { cn } from "@reactive-resume/utils";

type Props = {
  size?: number;
  className?: string;
};

export const Logo = ({ size = 32, className }: Props) => {
  return (
    <div className={cn("flex items-center gap-x-2", className)}>
      <img
        src="/logo/gfaze-logo.png"
        width={size}
        height={size}
        alt="GFAZE"
        className="rounded-sm"
      />
      <img
        src="/logo/gigafaze-logo-clean.png"
        width={size}
        height={size}
        alt="GigaFaze"
        className="rounded-sm"
      />
    </div>
  );
};
