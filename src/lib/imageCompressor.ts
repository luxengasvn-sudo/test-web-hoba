/**
 * Utility to compress an image file client-side before upload.
 * It resizes the image (max width/height) and converts it to WebP format.
 */
export async function compressImage(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<File | Blob> {
  // SSR Safety Check
  if (typeof window === 'undefined' || typeof FileReader === 'undefined' || typeof HTMLCanvasElement === 'undefined') {
    return file;
  }

  const { maxWidth = 1200, maxHeight = 1200, quality = 0.75 } = options;

  // Only compress images
  if (!file.type || !file.type.startsWith('image/')) {
    return file;
  }

  // Skip SVG or GIF to preserve animations and vector properties
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file); // Fallback
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            
            // Generate a webp filename
            let newName = file.name || 'image.webp';
            const dotIdx = newName.lastIndexOf('.');
            if (dotIdx !== -1) {
              newName = newName.substring(0, dotIdx) + '.webp';
            } else {
              newName = newName + '.webp';
            }

            const compressedFile = new File([blob], newName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            console.log(
              `Compressed: ${file.name} (${(file.size / 1024).toFixed(1)} KB) -> ` +
              `${newName} (${(compressedFile.size / 1024).toFixed(1)} KB)`
            );

            resolve(compressedFile);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => {
        resolve(file);
      };
    };
    reader.onerror = () => {
      resolve(file);
    };
  });
}
