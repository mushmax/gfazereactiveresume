import { useTheme } from "@reactive-resume/hooks";
import { cn } from "@reactive-resume/utils";

type Props = {
  size?: number;
  className?: string;
};

export const Icon = ({ size = 32, className }: Props) => {
  const { isDarkMode: _isDarkMode } = useTheme();

  let src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

  src = "/logo/gfaze_logo.png";

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
