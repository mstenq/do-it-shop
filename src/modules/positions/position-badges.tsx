import { Badge } from "@/components/ui/badge";
import { ConvexType } from "@/utils/convexType";

type Props = {
  positions: ConvexType<"positions.get">[];
  size?: "default" | "sm" | "lg";
};
export const PositionBadges = ({ positions, size }: Props) => {
  return (
    <div className="flex flex-wrap gap-2">
      {positions.map((position) => (
        <Badge
          variant="secondary"
          size={size}
          key={position._id}
          className="flex items-center gap-2"
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: position.schedulerColor }}
          />
          <span>{position.name}</span>
        </Badge>
      ))}
    </div>
  );
};
