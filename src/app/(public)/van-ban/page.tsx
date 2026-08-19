import { executeDirectQuery } from '@/lib/db-direct';
import DocumentsClientPage, { DocumentItem } from './DocumentsClientPage';
import defaultDocuments from '@/lib/defaultDocuments.json';

export const dynamic = 'force-dynamic';

const getCleanDocUrl = (code: string, fileUrl?: string) => {
  const c = (code || '').trim();
  if (c === '105/2025/NĐ-CP') return '/uploads/documents/ND-105-2025-ve-PCCC.pdf';
  if (c === '87/2018/NĐ-CP') return '/uploads/documents/ND-87-ve-Kinh-doanh-khi.pdf';
  if (c === '96/2016/NĐ-CP') return '/uploads/documents/ND-96-quy-dinh-ve-ANTT.pdf';
  if (c === '14/QĐ-UBND') return '/uploads/documents/14-Quyet-dinh-phe-duyet-dieu-le-HOBA-2025.pdf';
  if (c === '12/QC-HOBA') return '/uploads/documents/12-Quy-che-hoat-dong-noi-bo-2025.pdf';
  
  if (!fileUrl || fileUrl === '#' || fileUrl.includes('hobalpg.vn/uploads/documents/')) {
    const match = defaultDocuments.find(def => def.code === c);
    if (match) return match.fileUrl;
  }
  return fileUrl || '#';
};

const normalizeCode = (code: string) => {
  return (code || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
};

export default async function Page() {
  const initialData: any = {
    documents: defaultDocuments as DocumentItem[]
  };

  try {
    const data = await executeDirectQuery({
      method: 'SELECT',
      table: 'documents',
      orderCol: 'publish_date',
      orderAscending: false
    });

    if (data && data.length > 0) {
      // Filter out test entries
      const validItems = data.filter((d: any) => !d.title?.toLowerCase().includes('test') && !d.code?.toLowerCase().includes('test'));
      
      const mapped: DocumentItem[] = validItems.map((d: any) => ({
        code: d.code,
        title: d.title,
        category: d.category,
        issuer: d.issuer,
        date: d.publish_date ? (d.publish_date instanceof Date ? d.publish_date.toISOString().split('T')[0] : String(d.publish_date).split('T')[0]) : '',
        fileSize: d.file_size || '1.5 MB',
        description: d.description || '',
        fileUrl: getCleanDocUrl(d.code, d.file_url)
      }));

      // Deduplicate by normalized code
      const docMap = new Map<string, DocumentItem>();
      for (const def of defaultDocuments) {
        docMap.set(normalizeCode(def.code), def as DocumentItem);
      }
      for (const m of mapped) {
        const norm = normalizeCode(m.code);
        if (norm) {
          const existing = docMap.get(norm);
          if (existing && existing.description && (!m.description || m.description.length < existing.description.length)) {
            continue;
          }
          docMap.set(norm, m);
        }
      }

      initialData.documents = Array.from(docMap.values());
    }
  } catch (error) {
    console.error('[Documents SSR] Failed to pre-fetch documents:', error);
    initialData.documents = defaultDocuments;
  }

  return <DocumentsClientPage initialData={initialData} />;
}
