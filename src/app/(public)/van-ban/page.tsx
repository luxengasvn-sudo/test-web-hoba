import { executeDirectQuery } from '@/lib/db-direct';
import DocumentsClientPage, { DocumentItem } from './DocumentsClientPage';
import defaultDocuments from '@/lib/defaultDocuments.json';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const initialData: any = {};

  try {
    const data = await executeDirectQuery({
      method: 'SELECT',
      table: 'documents',
      orderCol: 'publish_date',
      orderAscending: false
    });

    if (data && data.length > 0) {
      const mapped: DocumentItem[] = data.map((d: any) => ({
        code: d.code,
        title: d.title,
        category: d.category,
        issuer: d.issuer,
        date: d.publish_date,
        fileSize: d.file_size || '1.5 MB',
        description: d.description || '',
        fileUrl: d.file_url || '#'
      }));
      initialData.documents = mapped;
    } else {
      initialData.documents = [];
    }
  } catch (error) {
    console.error('[Documents SSR] Failed to pre-fetch documents:', error);
    initialData.documents = defaultDocuments;
  }

  return <DocumentsClientPage initialData={initialData} />;
}
