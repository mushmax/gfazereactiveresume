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
        className="rounded-full"
      />
      <img
        src="/logo/gigafaze-logo-new.jpg"
        width={size * 0.6}
        height={size * 0.6}
        alt="GigaFaze"
        className="rounded-sm"
      />
    </div>
  );
};
