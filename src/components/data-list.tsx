import { useValueList } from "@/hooks/use-value-list";
import { api } from "@convex/api";

type Group = (typeof api.valueList.all)["_args"]["group"];

type Props = {
  id?: string;
  group: Group;
};

export const DataList = ({ id, group }: Props) => {
  const valueList = useValueList({ group });
  return (
    <datalist id={id ?? group}>
      {valueList.map((item) => (
        <option key={item._id} value={item.value}>
          {item.value}
        </option>
      ))}
    </datalist>
  );
};
