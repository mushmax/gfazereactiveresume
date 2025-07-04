import { cn } from "@reactive-resume/utils";

type Props = {
  size?: number;
  className?: string;
};

export const Logo = ({ size = 32, className }: Props) => {
  const src = "/logo/gfaze_logo.png";

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt="GFAZE Resume"
      className={cn("rounded-full", className)}
    />
  );
};
