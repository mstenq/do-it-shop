import { ExternalLinkIcon } from "lucide-react";

export const UrlDisplay = ({ url }: { url: string | undefined }) => {
  if (!url) return null;

  const isValidUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  if (!isValidUrl(url))
    return <span className="text-red-500">Invalid URL</span>;

  return (
    <div>
      <div className="text-xs text-muted-foreground">Website</div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
      >
        <ExternalLinkIcon className="w-3 h-3" />
        <span className="text-sm break-all">{url}</span>
      </a>
    </div>
  );
};
