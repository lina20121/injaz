import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read file data'));
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Unable to encode file data'));
        return;
      }

      const separatorIndex = reader.result.indexOf(',');
      if (separatorIndex === -1) {
        reject(new Error('Invalid encoded file data'));
        return;
      }

      resolve(reader.result.slice(separatorIndex + 1));
    };
    reader.readAsDataURL(blob);
  });
}

export async function downloadFile(fileName: string, blob: Blob): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      const { uri } = await Filesystem.writeFile({
        path: fileName.replace(/[\\/]/g, '_'),
        data: await blobToBase64(blob),
        directory: Directory.Cache,
        recursive: true,
      });

      await Share.share({
        title: fileName,
        dialogTitle: fileName,
        files: [uri],
      });
      return true;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (error) {
    console.error(`Failed to download ${fileName}:`, error);
    window.alert('تعذر تنزيل الملف. يرجى المحاولة مرة أخرى.');
    return false;
  }
}
