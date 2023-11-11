import { CustomLink } from "@/components/CustomLink";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function UserDetailPage({ params }: any) {
  return (
    <div className="p-8">
      <CustomLink href="/users">Back</CustomLink>
      <div>Hello User {params.userId}</div>
    </div>
  );
}
