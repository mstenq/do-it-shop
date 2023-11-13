import { Select, SelectTrigger } from "@/components/ui/select";

type Props = {
  params: {
    roleId: string;
  };
};

export default function PermissionsDetailPage({ params }: Props) {
  return <div className="">Role: {params.roleId}</div>;
}
