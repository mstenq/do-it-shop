import { MapPinIcon } from "lucide-react";

interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

interface AddressDisplayProps {
  address?: Address;
  className?: string;
}

export function AddressDisplay({ address, className }: AddressDisplayProps) {
  if (!address) return null;

  const hasAnyAddressField =
    address.street ||
    address.city ||
    address.state ||
    address.zip ||
    address.country;

  if (!hasAnyAddressField) return null;

  const formatAddressLine = () => {
    const parts = [];

    if (address.street) {
      parts.push(address.street);
    }

    const cityStateZip = [];
    if (address.city) cityStateZip.push(address.city);
    if (address.state) cityStateZip.push(address.state);
    if (address.zip) cityStateZip.push(address.zip);

    if (cityStateZip.length > 0) {
      parts.push(cityStateZip.join(", "));
    }

    if (address.country) {
      parts.push(address.country);
    }

    return parts;
  };

  const addressLines = formatAddressLine();

  if (addressLines.length === 0) return null;

  return (
    <div className={className}>
      <div className="text-xs text-muted-foreground flex items-center gap-1">
        <MapPinIcon className="h-3 w-3" />
        Address
      </div>
      <div className="text-sm">
        {addressLines.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
    </div>
  );
}
