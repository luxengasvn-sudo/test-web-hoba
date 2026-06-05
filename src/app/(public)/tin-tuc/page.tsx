'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toSlug } from '@/lib/slug';

interface NewsItem {
  id: string;
  title: string;
  desc: string;
  content?: string;
  category: 'Hoạt động hiệp hội' | 'Bản tin chuyên ngành' | 'Kỹ thuật - An toàn';
  date: string;
  img: string;
  isFeatured?: boolean;
  slug?: string;
}

interface SidebarDoc {
  title: string;
  date: string;
}

function renderContent(content: string) {
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return <div className="news-detail-content" dangerouslySetInnerHTML={{ __html: content }} />;
  }

  return (
    <div className="space-y-4">
      {content.split(/\n\n+/).map((para, idx) => {
        const markdownImgRegex = /^!\[(.*?)\]\((.*?)\)$/;
        const match = markdownImgRegex.exec(para.trim());
        
        if (match) {
          const altText = match[1];
          const imageUrl = match[2];
          return (
            <div key={idx} className="my-6 rounded-xl overflow-hidden shadow-sm border border-outline-variant/30 text-center bg-white p-2">
              <img
                src={imageUrl}
                alt={altText}
                className="mx-auto max-h-[480px] object-contain rounded-lg"
              />
              {altText && (
                <p className="text-[11px] text-on-surface-variant italic mt-2 font-bold uppercase tracking-wider">
                  {altText}
                </p>
              )}
            </div>
          );
        }
        
        return (
          <p key={idx} className="whitespace-pre-line">
            {para}
          </p>
        );
      })}
    </div>
  );
}

const defaultNews: NewsItem[] = [
  {
    id: '1',
    title: 'Cập nhật xu hướng thị trường LPG khu vực phía Nam 2026',
    desc: 'Phân tích chuyên sâu về biến động cung cầu, giá gas thế giới và tác động đến các trạm chiết nạp toàn khu vực miền Nam trong năm 2026.',
    content: 'Thị trường khí hóa lỏng (LPG) tại khu vực phía Nam đang trải qua những biến động mạnh mẽ trong nửa đầu năm 2026. Nguồn cung gas nhập khẩu đối mặt với chi phí vận chuyển tăng cao do ảnh hưởng từ tình hình địa chính trị toàn cầu. Giá CP (Contract Price) thế giới liên tục duy trì ở mức cao gây áp lực lớn lên giá bán lẻ trong nước.\n\nTheo báo cáo phân tích mới nhất của Hiệp hội HOBA, các doanh nghiệp chiết nạp cần tối ưu hóa quy trình logistics và quản lý kho dự trữ để giảm thiểu rủi ro biến động giá. Dự báo nhu cầu tiêu thụ LPG công nghiệp vẫn duy trì mức tăng trưởng ổn định 5.2% nhờ sự phục hồi của các khu chế xuất tại Bình Dương và Đồng Nai.\n\nBên cạnh đó, các cơ quan ban ngành đang đẩy mạnh thanh tra việc tuân thủ các quy định an toàn nạp gas, buộc các trạm chiết nạp phải đầu tư nâng cấp hệ thống giám sát tự động để tránh bị đình chỉ hoạt động.',
    category: 'Bản tin chuyên ngành',
    date: '10 Tháng 05, 2026',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTnDaM8uzQn1_0DhmhC7KmeGLksQoODMcExU4UgxEcKMACoKgUXJW_2llmo7m-ViDB3xt2KW3AffPsNIEWvPC1uYoP833s0_aSIdyHJqgQJ3M7CeBBlXZb6AXaffkH0smJ-ud5Q1xRd87Fq9fBxQkp-UOoxSITgv85D-HFOp0IhgyruXjbG3lsDx9HPlbswwwJyQC1LeI0F7lTCuuNnRSBcWo3UUy-H2FP9vD9KSPm35z6PtDtTWMejNSdqXtYLoWrH28NsiAEQHc',
    isFeatured: true
  },
  {
    id: '2',
    title: 'Tăng cường tiêu chuẩn an toàn trong hệ thống chiết nạp',
    desc: 'Hướng dẫn mới nhất về quy trình PCCC và kiểm tra định kỳ hệ thống van an toàn bồn chứa khí hóa lỏng.',
    content: 'An toàn phòng chống cháy nổ luôn là ưu tiên hàng đầu trong hoạt động chiết nạp và kinh doanh LPG. Quy chuẩn kỹ thuật quốc gia mới ban hành yêu cầu tất cả các trạm nạp gas phải thực hiện kiểm định định kỳ hệ thống van an toàn bồn chứa và đường ống áp lực.\n\nCác chuyên gia kỹ thuật khuyến cáo doanh nghiệp nên sử dụng thiết bị đo lường chuẩn hóa và lưu lại nhật ký kiểm định chi tiết. Việc rà soát quy trình vận hành và tổ chức huấn luyện PCCC thực tế cho nhân viên trạm nạp cần được triển khai định kỳ mỗi 6 tháng để nâng cao khả năng phản ứng khi xảy ra sự cố đột xuất.',
    category: 'Kỹ thuật - An toàn',
    date: '06 Tháng 05, 2026',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCd2LKfPS_qVXIaFpb-YI8xVvamEFKJwsAWDR_F6_kMft_JUW1eji4905tchFl4JT3GENT7J4hmma4MEUcrBFLNin0zDrmnAit0SlkhGARJt5rbTmYD1n-_I6Mk37Z8Sr1EqM8Ldzg-6dMzSpy1wrTCyeuEZDczV-zDSpSukz371vL7lRlt3ephKeZgrc7LdnYCTjQHYVkmkUIUCeSowvxd1vn3SbgkU30srqfp_HKJPDSkcBNy-PNSId3_gsU4BJTTeL2qz5pVGz4'
  },
  {
    id: '3',
    title: 'HOBA tổ chức hội thảo kết nối 150+ doanh nghiệp gas',
    desc: 'Diễn đàn thường niên xúc tiến thương mại, thảo luận giải pháp tháo gỡ khó khăn về thủ tục cấp phép trạm nạp gas.',
    content: 'Vừa qua, Hiệp hội HOBA đã tổ chức thành công Hội thảo Kết nối Thương mại LPG 2026 thu hút sự tham gia của hơn 150 đại diện doanh nghiệp. Đây là cơ hội để các doanh nghiệp gặp gỡ, trao đổi và thảo luận các vướng mắc về mặt thủ tục hành chính, đặc biệt là quy trình cấp phép xây dựng trạm nạp mới.\n\nBan chấp hành Hiệp hội cam kết sẽ tổng hợp ý kiến đóng góp từ các hội viên và gửi văn bản kiến nghị lên các bộ ngành liên quan nhằm tháo gỡ nút thắt pháp lý, tạo điều kiện thuận lợi nhất cho hoạt động sản xuất kinh doanh khí gas tại khu vực phía Nam.',
    category: 'Hoạt động hiệp hội',
    date: '28 Tháng 04, 2026',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpq3p2BNGjKIzkbtZzJx6XE4QhBg8rX3SLG7kaZe3xIzwjK4UxrkRz0wGNIgs6vhQs6MGUuQLR6Ip4XEAzCdspTirigwb78XhgaSeci66qanxZLWWKsJS3QVhzuWtumYfio8watxGy2eSI_gCk4mYA2weVkRk3vPFme3OWZ7SVwBXiJS_bA4gDQhTX6mNnm0SnlIFp843ZQ1aAqLJHEQEZxzmaicFKorrJFu4R-Po8M4tuSkTztog70nwDnGdwJo7GrXS8V5CJ0qs'
  },
  {
    id: '4',
    title: 'Hướng dẫn mới về kiểm định bồn bể áp lực 2026',
    desc: 'Cập nhật nghị định mới quy định chặt chẽ hơn về kiểm định kỹ thuật an toàn lao động đối với bồn chứa LPG.',
    content: 'Chính phủ vừa ban hành nghị định mới quy định chặt chẽ hơn về kiểm định kỹ thuật an toàn lao động đối với các thiết bị bồn bể áp lực chứa LPG. Toàn bộ bồn chứa thương mại phải được kiểm tra định kỳ nghiêm ngặt bằng phương pháp siêu âm mối hàn và thử áp lực thủy tĩnh.\n\nCác doanh nghiệp vi phạm có thể chịu hình thức chế tài hành chính rất nặng hoặc đình chỉ giấy phép hoạt động kinh doanh gas. Hiệp hội HOBA khuyến cáo hội viên chủ động rà soát hệ thống của mình ngay từ hôm nay để đảm bảo tuân thủ đầy đủ.',
    category: 'Kỹ thuật - An toàn',
    date: '15 Tháng 04, 2026',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0epjt4jHlAwZXMkOTECe3O5TtboSouvkBg0LkmS9UTakVTL8ilvgyR9yCLlYOA3Y4SIfyqun3MSg5aPf9amyLVFeRbI0Numz0XvdgU760wcXN1-jCFocY0yVqMnwSZ8U4gVatmQe5Lm6y27cYBrRVkEGtarzsBdjUqrVkuohwA3z12VHkHEYtuZ2k-jTl4-d7buzYHhBJNdaFSNJlcE8yT2c_Ap-9ZUkUuDmDmuvrtimxRGQMKQBnURfC-i9wq7WO7FkJO7u4idI'
  }
];

export function NewsDetailPage({ id, slug }: { id?: string; slug?: string }) {
  const router = useRouter();
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticle() {
      setLoading(true);
      const queryField = id ? 'id' : 'slug';
      const queryValue = id || slug;

      if (!queryValue) {
        setArticle(null);
        setLoading(false);
        return;
      }

      if (!supabase) {
        const found = defaultNews.find(n => id ? n.id === id : (n.slug === slug || toSlug(n.title) === slug));
        setArticle(found || null);
        setRecentNews(defaultNews.filter(n => id ? n.id !== id : (n.slug !== slug && toSlug(n.title) !== slug)));
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq(queryField, queryValue)
          .single();

        if (error) throw error;

        let currentId = id;
        if (data) {
          currentId = data.id;
          let formattedDate = data.publish_date;
          try {
            const dt = new Date(data.publish_date);
            formattedDate = `${dt.getDate()} Tháng ${dt.getMonth() + 1}, ${dt.getFullYear()}`;
          } catch (_) {}

          setArticle({
            id: data.id,
            title: data.title,
            slug: data.slug,
            desc: data.description || '',
            content: data.content || '',
            category: data.category as any,
            date: formattedDate,
            img: data.thumbnail_url || 'https://images.unsplash.com/photo-1542282088-fe8426682b8f'
          });
        }

        const { data: recent, error: recentErr } = await supabase
          .from('news')
          .select('id, title, slug, description, category, publish_date, thumbnail_url')
          .eq('status', 'Published')
          .neq('id', currentId || '')
          .order('publish_date', { ascending: false })
          .limit(3);

        if (!recentErr && recent) {
          const formattedRecent = recent.map((r: any) => {
            let formattedDate = r.publish_date;
            try {
              const dt = new Date(r.publish_date);
              formattedDate = `${dt.getDate()} Tháng ${dt.getMonth() + 1}, ${dt.getFullYear()}`;
            } catch (_) {}
            return {
              id: r.id,
              title: r.title,
              slug: r.slug,
              desc: r.description || '',
              category: r.category as any,
              date: formattedDate,
              img: r.thumbnail_url || 'https://images.unsplash.com/photo-1542282088-fe8426682b8f'
            };
          });
          setRecentNews(formattedRecent);
        }
      } catch (err) {
        console.error('Lỗi khi tải bài viết từ Supabase, chuyển sang fallback:', err);
        const found = defaultNews.find(n => id ? n.id === id : (n.slug === slug || toSlug(n.title) === slug));
        setArticle(found || null);
        setRecentNews(defaultNews.filter(n => id ? n.id !== id : (n.slug !== slug && toSlug(n.title) !== slug)));
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [id, slug]);

  if (loading) {
    return (
      <div className="flex-grow pt-32 pb-16 bg-surface flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-xs text-on-surface-variant font-medium">Đang tải nội dung bài viết...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex-grow pt-32 pb-16 bg-surface flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6 max-w-sm px-margin-mobile">
          <span className="material-symbols-outlined text-6xl text-outline-variant">error</span>
          <h2 className="text-xl font-black text-primary">Bài viết không tồn tại</h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Tin tức bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ khỏi hệ thống.
          </p>
          <button
            onClick={() => router.push('/tin-tuc')}
            className="w-full py-3 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary-container transition-all"
          >
            Quay lại trang Tin tức
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full overflow-x-hidden pt-20">
      <title>{`${article.title} | HOBA LPG`}</title>
      <meta name="description" content={article.desc || `Đọc bài viết chi tiết ${article.title} trên trang thông tin của Hiệp hội HOBA LPG.`} />
      <section className="py-12 bg-surface text-xs md:text-sm text-on-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
          <div className="flex items-center gap-2 text-xs mb-6 text-on-surface-variant font-medium">
            <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <Link href="/tin-tuc" className="hover:text-primary transition-colors">Tin tức</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-outline line-clamp-1 max-w-[200px] md:max-w-xs">{article.title}</span>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <article className="lg:col-span-8 space-y-6 bg-white p-6 md:p-8 rounded-2xl border border-outline-variant/30 shadow-sm">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded uppercase">
                  {article.category}
                </span>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-primary leading-tight">
                  {article.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant border-y border-outline-variant/20 py-3 font-semibold">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">calendar_month</span> {article.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">person</span> Tác giả: Hiệp hội HOBA
                  </span>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden shadow-sm aspect-video relative">
                <img
                  alt={article.title}
                  className="w-full h-full object-cover"
                  src={article.img}
                />
              </div>

              <p className="text-sm md:text-base font-bold text-on-background leading-relaxed border-l-4 border-secondary pl-4">
                {article.desc}
              </p>

              <div className="text-xs md:text-sm text-on-surface-variant leading-relaxed font-medium">
                {article.content && renderContent(article.content)}
              </div>

              <div className="flex flex-wrap justify-between items-center gap-4 pt-6 border-t border-outline-variant/20">
                <button
                  onClick={() => router.push('/tin-tuc')}
                  className="px-6 py-2.5 rounded-lg border-2 border-primary text-primary hover:bg-primary/5 font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  Quay lại danh sách
                </button>
                <div className="flex gap-2">
                  <button className="w-9 h-9 rounded-full bg-surface-container hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-lg">share</span>
                  </button>
                  <button className="w-9 h-9 rounded-full bg-surface-container hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-lg">bookmark</span>
                  </button>
                </div>
              </div>
            </article>

            <div className="lg:col-span-4 space-y-6">
              {recentNews.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm">
                  <h3 className="text-base font-bold text-primary mb-6 border-b border-primary/10 pb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl">newspaper</span> Tin tức khác
                  </h3>
                  <div className="space-y-6">
                    {recentNews.map((item) => (
                      <Link
                        key={item.id}
                        href={item.slug ? `/tin-tuc/${item.slug}` : `/tin-tuc?id=${item.id}`}
                        className="group flex gap-3 cursor-pointer"
                      >
                        <div className="w-20 h-16 rounded overflow-hidden flex-shrink-0 bg-surface-container-low shadow-sm">
                          <img
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            src={item.img}
                          />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="font-bold text-xs text-primary group-hover:text-secondary transition-colors line-clamp-2 leading-tight">
                            {item.title}
                          </h4>
                          <span className="text-[9px] text-on-surface-variant font-bold uppercase mt-1 block">
                            {item.date}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-primary text-white p-6 rounded-2xl relative overflow-hidden">
                <div className="relative z-10 space-y-3">
                  <h4 className="text-base font-bold text-secondary-fixed-dim">Tiêu chuẩn an toàn</h4>
                  <p className="text-xs opacity-80 leading-relaxed">
                    Xem các quy định mới nhất của Nhà nước về kiểm định an toàn kỹ thuật bồn chứa LPG thương mại.
                  </p>
                  <Link href="/van-ban" className="bg-[#ff9800] text-white px-4 py-2 rounded text-xs font-bold hover:bg-[#f57c00] transition-colors inline-block">
                    Tra cứu ngay
                  </Link>
                </div>
                <span className="material-symbols-outlined text-7xl text-white/5 absolute bottom-0 right-0">security</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function NewsListPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [sidebarDocs, setSidebarDocs] = useState<SidebarDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['Tất cả', 'Hoạt động hiệp hội', 'Bản tin chuyên ngành', 'Kỹ thuật - An toàn'];

  const defaultSidebarDocs: SidebarDoc[] = [
    { title: 'Quy chuẩn an toàn LPG 2026', date: '20/04/2026' },
    { title: 'Điều lệ Hoạt động Hiệp hội', date: '10/01/2026' }
  ];

  useEffect(() => {
    async function loadNewsData() {
      setLoading(true);
      if (!supabase) {
        setNewsList(defaultNews);
        setSidebarDocs(defaultSidebarDocs);
        setLoading(false);
        return;
      }

      try {
        const { data: newsData, error: newsErr } = await supabase
          .from('news')
          .select('*')
          .eq('status', 'Published')
          .order('publish_date', { ascending: false });

        if (newsErr) throw newsErr;

        if (newsData && newsData.length > 0) {
          const formatted: NewsItem[] = newsData.map((d: any) => {
            let formattedDate = d.publish_date;
            try {
              const dt = new Date(d.publish_date);
              formattedDate = `${dt.getDate()} Tháng ${dt.getMonth() + 1}, ${dt.getFullYear()}`;
            } catch (_) {}

            return {
              id: d.id,
              title: d.title,
              slug: d.slug,
              desc: d.description || '',
              category: d.category as any,
              date: formattedDate,
              img: d.thumbnail_url || 'https://images.unsplash.com/photo-1542282088-fe8426682b8f',
              isFeatured: d.is_featured
            };
          });
          setNewsList(formatted);
        } else {
          setNewsList([]);
        }

        const { data: docsData } = await supabase
          .from('documents')
          .select('title, publish_date')
          .order('publish_date', { ascending: false })
          .limit(3);

        if (docsData && docsData.length > 0) {
          const side: SidebarDoc[] = docsData.map((d: any) => {
            let formattedDate = d.publish_date;
            try {
              const dt = new Date(d.publish_date);
              formattedDate = `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`;
            } catch (_) {}
            return {
              title: d.title,
              date: formattedDate
            };
          });
          setSidebarDocs(side);
        } else {
          setSidebarDocs(defaultSidebarDocs);
        }
      } catch (err) {
        console.error('Lỗi tải tin tức từ Supabase, chuyển sang fallback:', err);
        setNewsList(defaultNews);
        setSidebarDocs(defaultSidebarDocs);
      } finally {
        setLoading(false);
      }
    }
    loadNewsData();
  }, []);

  const filteredNews = newsList.filter((item) => {
    return selectedCategory === 'Tất cả' || item.category === selectedCategory;
  });

  const featuredArticle = newsList.find(n => n.isFeatured) || newsList[0];
  const regularArticles = filteredNews.filter(n => n.id !== (featuredArticle?.id) || selectedCategory !== 'Tất cả');

  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      <title>Tin tức & Sự kiện | HOBA LPG</title>
      <meta name="description" content="Tin tức chuyên ngành khí hóa lỏng, hoạt động của hiệp hội HOBA, và kiến thức về an toàn kỹ thuật LPG." />
      
      <section className="relative h-[300px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-primary/60 z-10"></div>
        <img
          alt="News & Events Background"
          className="absolute inset-0 w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTnDaM8uzQn1_0DhmhC7KmeGLksQoODMcExU4UgxEcKMACoKgUXJW_2llmo7m-ViDB3xt2KW3AffPsNIEWvPC1uYoP833s0_aSIdyHJqgQJ3M7CeBBlXZb6AXaffkH0smJ-ud5Q1xRd87Fq9fBxQkp-UOoxSITgv85D-HFOp0IhgyruXjbG3lsDx9HPlbswwwJyQC1LeI0F7lTCuuNnRSBcWo3UUy-H2FP9vD9KSPm35z6PtDtTWMejNSdqXtYLoWrH28NsiAEQHc"
        />
        <div className="relative z-20 max-w-container-max mx-auto px-margin-mobile md:px-gutter w-full text-white">
          <div className="flex items-center gap-2 text-xs mb-4 opacity-80">
            <Link href="/" className="hover:underline">Trang chủ</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Tin tức & Sự kiện</span>
          </div>
          <h1 className="text-4xl font-black mb-2">Tin tức & Sự kiện</h1>
          <p className="text-sm opacity-80">Cập nhật xu hướng thị trường, an toàn kỹ thuật và hoạt động của hiệp hội HOBA</p>
        </div>
      </section>

      <section className="bg-white border-b border-outline-variant/30 py-4">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter flex gap-3 overflow-x-auto no-scrollbar">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="py-12 bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
          {loading ? (
            <div className="p-12 text-center text-xs text-on-surface-variant font-medium">Đang tải tin tức...</div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
              <div className="lg:col-span-8 space-y-8">
                {selectedCategory === 'Tất cả' && featuredArticle && (
                  <article className="group grid md:grid-cols-2 gap-6 items-center bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 border border-outline-variant/20">
                    <div className="relative h-full min-h-[240px] md:min-h-[280px] overflow-hidden">
                      <img
                        alt={featuredArticle.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        src={featuredArticle.img}
                      />
                      <div className="absolute top-4 left-4 bg-secondary text-white px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest">
                        Tiêu điểm
                      </div>
                    </div>
                    <div className="p-6 md:p-8 space-y-3">
                      <div className="flex items-center gap-2 text-on-surface-variant font-bold text-[10px] uppercase tracking-widest">
                        <span className="material-symbols-outlined text-sm">calendar_month</span> {featuredArticle.date}
                      </div>
                      <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded uppercase">
                        {featuredArticle.category}
                      </span>
                      <Link href={featuredArticle.slug ? `/tin-tuc/${featuredArticle.slug}` : `/tin-tuc?id=${featuredArticle.id}`}>
                        <h3 className="text-lg font-bold text-primary group-hover:text-secondary transition-colors line-clamp-3 cursor-pointer">
                          {featuredArticle.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                        {featuredArticle.desc}
                      </p>
                      <Link href={featuredArticle.slug ? `/tin-tuc/${featuredArticle.slug}` : `/tin-tuc?id=${featuredArticle.id}`} className="text-primary font-bold text-xs inline-flex items-center gap-1.5 group-hover:gap-3 transition-all cursor-pointer">
                        Đọc tiếp <span className="material-symbols-outlined text-base">trending_flat</span>
                      </Link>
                    </div>
                  </article>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {regularArticles.length > 0 ? (
                    regularArticles.map((article, idx) => (
                      <article key={idx} className="group space-y-3 bg-white p-4 rounded-2xl border border-outline-variant/30 hover:shadow-md transition-shadow">
                        <Link href={article.slug ? `/tin-tuc/${article.slug}` : `/tin-tuc?id=${article.id}`}>
                          <div className="rounded-xl overflow-hidden aspect-video shadow-sm cursor-pointer">
                            <img
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              src={article.img}
                            />
                          </div>
                        </Link>
                        <div className="flex items-center gap-2 text-on-surface-variant text-[10px] font-bold uppercase">
                          <span className="material-symbols-outlined text-sm">calendar_month</span> {article.date}
                        </div>
                        <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-bold rounded uppercase">
                          {article.category}
                        </span>
                        <Link href={article.slug ? `/tin-tuc/${article.slug}` : `/tin-tuc?id=${article.id}`}>
                          <h4 className="text-sm font-bold text-primary group-hover:text-secondary transition-colors line-clamp-2 leading-snug cursor-pointer">
                            {article.title}
                          </h4>
                        </Link>
                        <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">{article.desc}</p>
                        <Link href={article.slug ? `/tin-tuc/${article.slug}` : `/tin-tuc?id=${article.id}`} className="text-primary font-bold text-xs flex items-center gap-1.5 hover:gap-2.5 transition-all cursor-pointer">
                          Xem tin <span className="material-symbols-outlined text-base">arrow_right_alt</span>
                        </Link>
                      </article>
                    ))
                  ) : (
                    <div className="md:col-span-2 text-center py-12 text-on-surface-variant text-sm font-medium">
                      Không có tin tức nào trong chuyên mục này.
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-4 space-y-8">
                <div className="bg-white p-6 rounded-2xl border border-outline-variant/30">
                  <h3 className="text-base font-bold text-primary mb-6 border-b border-primary/10 pb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl">description</span> Văn bản nổi bật
                  </h3>
                  <div className="space-y-4">
                    {sidebarDocs.map((doc, idx) => (
                      <div key={idx} className="p-3 bg-surface-container-low rounded-lg flex items-center justify-between">
                        <div className="flex-grow pr-3">
                          <h4 className="font-bold text-xs text-primary line-clamp-1">{doc.title}</h4>
                          <p className="text-[9px] text-on-surface-variant">Ngày: {doc.date}</p>
                        </div>
                        <Link href="/van-ban" className="material-symbols-outlined text-secondary cursor-pointer hover:text-[#93000d]">
                          download
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-primary text-white p-6 rounded-2xl relative overflow-hidden">
                  <div className="relative z-10 space-y-3">
                    <h4 className="text-base font-bold text-secondary-fixed-dim">Tiêu chuẩn an toàn</h4>
                    <p className="text-xs opacity-80 leading-relaxed">
                      Xem các quy định mới nhất của Nhà nước về kiểm định an toàn kỹ thuật bồn chứa LPG thương mại.
                    </p>
                    <Link href="/van-ban" className="bg-[#ff9800] text-white px-4 py-2 rounded text-xs font-bold hover:bg-[#f57c00] transition-colors inline-block">
                      Tra cứu ngay
                    </Link>
                  </div>
                  <span className="material-symbols-outlined text-7xl text-white/5 absolute bottom-0 right-0">security</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function NewsPageSwitch() {
  const searchParams = useSearchParams();
  const articleId = searchParams.get('id');
  const articleSlug = searchParams.get('slug');

  if (articleId) {
    return <NewsDetailPage id={articleId} />;
  }
  if (articleSlug) {
    return <NewsDetailPage slug={articleSlug} />;
  }

  return <NewsListPage />;
}

export default function NewsPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow pt-32 pb-16 bg-surface flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-xs text-on-surface-variant font-medium">Đang tải...</p>
        </div>
      </div>
    }>
      <NewsPageSwitch />
    </Suspense>
  );
}
