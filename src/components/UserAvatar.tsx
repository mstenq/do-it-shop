import { cn } from "@/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { md5 } from "@/server/utils";

type UserAvatarProps<T> = {
  user: T;
  className?: string;
};

type BaseUser = {
  email: string;
  firstName: string;
  lastName: string;
};

const generateGravatar = (email: string) => {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?d=404`;
};

const initials = (firstName: string, lastName: string) => {
  return `${firstName[0]?.toUpperCase()}${lastName[0]?.toUpperCase()}`;
};

const randomColor = (name: string) => {
  const colors = [
    "border-red-700 text-red-700 bg-red-50  dark:bg-red-700/20 dark:text-red-600",
    "border-yellow-700 text-yellow-700 bg-yellow-50 dark:bg-yellow-700/20 dark:text-yellow-600",
    "border-green-700 text-green-700 bg-green-50 text-green-700  dark:bg-green-700/20 dark:text-green-600",
    "border-blue-700 text-blue-700 bg-blue-50 dark:bg-blue-700/20 dark:text-blue-600",
    "border-indigo-700 text-indigo-700 bg-indigo-50 dark:bg-indigo-700/20 dark:text-indigo-600",
    "border-purple-700 text-purple-700 bg-purple-50 dark:bg-purple-700/20 dark:text-purple-600",
    "border-pink-700 text-pink-700 bg-pink-50 dark:bg-pink-700/20 dark:text-pink-600",
    "border-orange-700 text-orange-700 bg-orange-50 dark:bg-orange-700/20 dark:text-orange-600",
    "border-amber-700 text-amber-700 bg-amber-50 dark:bg-amber-700/20 dark:text-amber-600",
    "border-lime-700 text-lime-700 bg-lime-50 dark:bg-lime-700/20 dark:text-lime-600",
    "border-emerald-700 text-emerald-700 bg-emerald-50 dark:bg-emerald-700/20 dark:text-emerald-600",
    "border-teal-700 text-teal-700 bg-teal-50 dark:bg-teal-700/20 dark:text-teal-600",
    "border-cyan-700 text-cyan-700 bg-cyan-50 dark:bg-cyan-700/20 dark:text-cyan-600",
    "border-sky-700 text-sky-700 bg-sky-50 dark:bg-sky-700/20 dark:text-sky-600",
    "border-violet-700 text-violet-700 bg-violet-50 dark:bg-violet-700/20 dark:text-violet-600",
    "border-fuchsia-700 text-fuchsia-700 bg-fuchsia-50 dark:bg-fuchsia-700/20 dark:text-fuchsia-600",
    "border-rose-700 text-rose-700 bg-rose-50 dark:bg-rose-700/20 dark:text-rose-600",
  ];
  const index = name
    .split("")
    .map((char) => char.charCodeAt(0))
    .reduce((acc, curr) => acc + curr, 0);
  return colors[index % colors.length];
};

export const UserAvatar = <T extends BaseUser>({
  user,
  className,
}: UserAvatarProps<T>) => {
  return (
    <Avatar className={className}>
      <AvatarImage src={generateGravatar(user.email)} />
      <AvatarFallback className={cn(randomColor(`${user.email}`), "border")}>
        {initials(user.firstName, user.lastName)}
      </AvatarFallback>
    </Avatar>
  );
};
