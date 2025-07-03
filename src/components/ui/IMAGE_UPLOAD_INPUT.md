# ImageUploadInput Component

A React component for uploading images to Convex storage with drag-and-drop functionality and preview.

## Features

- ✅ Drag and drop image upload
- ✅ Click to select files
- ✅ Image preview with hover controls
- ✅ Upload progress indicator
- ✅ Error handling and validation
- ✅ File size limits
- ✅ React Hook Form integration
- ✅ ShadcnUI styling
- ✅ Convex storage integration

## Usage

```tsx
import { ImageUploadInput } from "@/components/ui/image-upload-input";
import { useForm } from "react-hook-form";

const MyForm = () => {
  const form = useForm({
    defaultValues: {
      imageStorageId: "",
    },
  });

  return (
    <FormField
      control={form.control}
      name="imageStorageId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Image</FormLabel>
          <FormControl>
            <ImageUploadInput
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="Drop an image here, or click to select"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
```

## Props

| Prop          | Type                                       | Default                                    | Description                         |
| ------------- | ------------------------------------------ | ------------------------------------------ | ----------------------------------- |
| `value`       | `string \| undefined`                      | -                                          | The Convex storage ID               |
| `onChange`    | `(storageId: string \| undefined) => void` | -                                          | Callback when storage ID changes    |
| `onBlur`      | `() => void`                               | -                                          | Callback when component loses focus |
| `disabled`    | `boolean`                                  | `false`                                    | Whether the component is disabled   |
| `className`   | `string`                                   | -                                          | Additional CSS classes              |
| `accept`      | `string`                                   | `"image/*"`                                | File types to accept                |
| `maxSize`     | `number`                                   | `5242880`                                  | Maximum file size in bytes (5MB)    |
| `placeholder` | `string`                                   | `"Drop an image here, or click to select"` | Placeholder text                    |

## File Validation

- Supports common image formats (JPEG, PNG, WebP, etc.)
- Default maximum file size: 5MB
- Displays error messages for invalid files

## Styling

The component uses ShadcnUI design tokens and follows the established patterns:

- Consistent with other form inputs
- Proper focus states and accessibility
- Responsive design
- Dark mode support

## Dependencies

- `react-dropzone` - For drag and drop functionality
- `convex/react` - For Convex storage integration
- `lucide-react` - For icons

## Related Components

- `useConvexStorageUrl` - Hook for generating storage URLs
- `LoadingSpinner` - Loading indicator component
- `Button` - ShadcnUI button component

## Examples

### Basic Usage

```tsx
<ImageUploadInput value={storageId} onChange={setStorageId} />
```

### With Custom Placeholder

```tsx
<ImageUploadInput
  value={storageId}
  onChange={setStorageId}
  placeholder="Upload your profile picture"
/>
```

### With Size Limit

```tsx
<ImageUploadInput
  value={storageId}
  onChange={setStorageId}
  maxSize={2 * 1024 * 1024} // 2MB
/>
```

### Disabled State

```tsx
<ImageUploadInput
  value={storageId}
  onChange={setStorageId}
  disabled={isLoading}
/>
```
