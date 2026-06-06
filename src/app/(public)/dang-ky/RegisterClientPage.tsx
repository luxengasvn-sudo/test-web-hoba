'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function RegisterClientPage({ initialData }: { initialData?: any }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    taxCode: '',
    address: '',
    phone: '',
    businessType: 'Phân phối & Bán lẻ',
    repName: '',
    repRole: '',
    repEmail: '',
    repPhone: '',
    licenseFile: '',
    licenseFileName: '',
    safetyFile: '',
    safetyFileName: '',
    logoUrl: '',
    repAvatarUrl: '',
    termsAccepted: false
  });

  const [logoUploading, setLogoUploading] = useState(false);
  const [repAvatarUploading, setRepAvatarUploading] = useState(false);

  const totalSteps = 4;

  const [pageConfig, setPageConfig] = useState(initialData?.registerPageConfig || {
    title: 'Đăng Ký Hội Viên Doanh Nghiệp',
    subtitle: 'Gia nhập cộng đồng LPG Việt Nam để nâng cao tiêu chuẩn an toàn và kết nối cơ hội kinh doanh bền vững.',
    hotline: '1900 1234',
    step1Label: 'Doanh nghiệp',
    step2Label: 'Người đại diện',
    step3Label: 'Hồ sơ pháp lý',
    step4Label: 'Xác nhận',
    agreementText: 'Tôi cam kết các thông tin cung cấp là chính xác và hoàn toàn chịu trách nhiệm trước pháp luật cũng như các quy định của Hội.'
  });
  const [registrationOpen, setRegistrationOpen] = useState(initialData?.registrationOpen !== undefined ? initialData.registrationOpen : true);

  useEffect(() => {
    if (initialData?.registerPageConfig && initialData?.registrationOpen !== undefined) {
      setPageConfig(initialData.registerPageConfig);
      setRegistrationOpen(initialData.registrationOpen);
      return;
    }

    async function loadPageConfig() {
      if (!supabase) {
        const savedRegister = localStorage.getItem('hoba_website_config_register');
        if (savedRegister) {
          try {
            setPageConfig((prev: any) => ({ ...prev, ...JSON.parse(savedRegister) }));
          } catch (e) {}
        }
        const savedGeneral = localStorage.getItem('hoba_website_config_general');
        if (savedGeneral) {
          try {
            const gen = JSON.parse(savedGeneral);
            if (gen.registrationOpen !== undefined) {
              setRegistrationOpen(gen.registrationOpen);
            }
          } catch (e) {}
        }
        return;
      }
      try {
        const { data: regData } = await supabase
          .from('website_config')
          .select('value')
          .eq('key', 'registerpage')
          .single();
        if (regData?.value) {
          setPageConfig((prev: any) => ({ ...prev, ...regData.value }));
        }

        const { data: genData } = await supabase
          .from('website_config')
          .select('value')
          .eq('key', 'general')
          .single();
        if (genData?.value && genData.value.registrationOpen !== undefined) {
          setRegistrationOpen(genData.value.registrationOpen);
        }
      } catch (err) {
        console.error('Lỗi khi tải cấu hình trang đăng ký công khai:', err);
      }
    }
    loadPageConfig();
  }, [initialData]);

  const uploadImage = async (file: File): Promise<string> => {
    if (!supabase) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `member-assets/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('hoba-assets')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('hoba-assets')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const uploadFile = async (file: File): Promise<string> => {
    if (!supabase) {
      const fileId = `file_${Math.random().toString(36).substring(2, 15)}`;
      const key = `member_doc_${fileId}`;
      try {
        const { saveFile } = await import('@/lib/indexedDB');
        await saveFile(key, file);
      } catch (e) {
        console.error('IndexedDB save error:', e);
      }
      return `indexeddb:${key}`;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `member-documents/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('hoba-assets')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('hoba-assets')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleImageUploadChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoUrl' | 'repAvatarUrl',
    setUploading: (u: boolean) => void
  ) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await uploadImage(e.target.files[0]);
        setFormData(prev => ({ ...prev, [field]: url }));
      } catch (err) {
        alert('Lỗi tải ảnh lên: ' + (err as Error).message);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'licenseFile' | 'safetyFile') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const nameField = field === 'licenseFile' ? 'licenseFileName' : 'safetyFileName';
      setFormData(prev => ({ ...prev, [nameField]: file.name }));
      try {
        const url = await uploadFile(file);
        setFormData(prev => ({ ...prev, [field]: url }));
      } catch (err) {
        alert('Lỗi tải file lên: ' + (err as Error).message);
        setFormData(prev => ({ ...prev, [nameField]: '' }));
      }
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      if (currentStep === 1) {
        if (!formData.companyName || !formData.taxCode || !formData.address || !formData.phone) {
          alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
          return;
        }
      }
      if (currentStep === 2) {
        if (!formData.repName || !formData.repRole || !formData.repEmail || !formData.repPhone) {
          alert('Vui lòng điền đầy đủ thông tin người đại diện.');
          return;
        }
      }
      if (currentStep === 3) {
        if (!formData.licenseFile || !formData.safetyFile) {
          alert('Vui lòng đính kèm tài liệu pháp lý.');
          return;
        }
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.termsAccepted) {
      alert('Vui lòng đồng ý với các điều khoản của Hiệp hội.');
      return;
    }

    setSubmitting(true);

    if (!supabase) {
      const saved = localStorage.getItem('hoba_website_members');
      let currentList: any[] = [];
      if (saved) {
        try {
          currentList = JSON.parse(saved);
        } catch (e) {}
      }

      const newId = String(Date.now());
      const newDbMem = {
        id: newId,
        company_name: formData.companyName,
        tax_code: formData.taxCode,
        address: formData.address,
        phone: formData.phone,
        email: formData.repEmail,
        business_type: formData.businessType,
        representative_name: formData.repName,
        representative_role: formData.repRole,
        representative_email: formData.repEmail,
        representative_phone: formData.repPhone,
        status: 'Pending',
        license_file_url: formData.licenseFile,
        safety_file_url: formData.safetyFile,
        logo_url: formData.logoUrl || null,
        representative_avatar_url: formData.repAvatarUrl || null,
        created_at: new Date().toISOString()
      };

      currentList = [newDbMem, ...currentList];
      localStorage.setItem('hoba_website_members', JSON.stringify(currentList));

      alert('Đăng ký thành công! Hồ sơ của doanh nghiệp đã được lưu vào hệ thống ở chế độ Offline (Local Storage) và đang chờ phê duyệt.');
      resetForm();
      setSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.from('members').insert([
        {
          company_name: formData.companyName,
          tax_code: formData.taxCode,
          address: formData.address,
          phone: formData.phone,
          email: formData.repEmail,
          business_type: formData.businessType,
          representative_name: formData.repName,
          representative_role: formData.repRole,
          representative_email: formData.repEmail,
          representative_phone: formData.repPhone,
          status: 'Pending',
          license_file_url: formData.licenseFile,
          safety_file_url: formData.safetyFile,
          logo_url: formData.logoUrl || null,
          representative_avatar_url: formData.repAvatarUrl || null
        }
      ]);

      if (error) throw error;

      alert('Đăng ký thành công! Hồ sơ của doanh nghiệp đã được lưu vào hệ thống và đang chờ phê duyệt.');
      resetForm();
    } catch (err) {
      console.error('Lỗi khi gửi hồ sơ lên Supabase:', err);
      alert('Không thể gửi hồ sơ đăng ký lên cơ sở dữ liệu. Lỗi: ' + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      companyName: '',
      taxCode: '',
      address: '',
      phone: '',
      businessType: 'Phân phối & Bán lẻ',
      repName: '',
      repRole: '',
      repEmail: '',
      repPhone: '',
      licenseFile: '',
      licenseFileName: '',
      safetyFile: '',
      safetyFileName: '',
      logoUrl: '',
      repAvatarUrl: '',
      termsAccepted: false
    });
  };

  const stepLabels = [
    { label: pageConfig.step1Label, number: 1 },
    { label: pageConfig.step2Label, number: 2 },
    { label: pageConfig.step3Label, number: 3 },
    { label: pageConfig.step4Label, number: 4 }
  ];

  return (
    <div className="flex-grow pt-24 pb-16 bg-surface-container-low min-h-screen">
      <title>Đăng ký Hội viên | HOBA LPG</title>
      <meta name="description" content="Đăng ký gia nhập Hiệp hội Gas và Kinh doanh Khí hóa lỏng TP.HCM (HOBA) để kết nối doanh nghiệp và nâng cao tiêu chuẩn an toàn." />
      <main className="max-w-4xl mx-auto px-margin-mobile md:px-gutter">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-primary mb-4">{pageConfig.title}</h1>
          <p className="text-sm md:text-base text-on-surface-variant max-w-2xl mx-auto">
            {pageConfig.subtitle}
          </p>
        </div>

        {!registrationOpen ? (
          <div className="bg-white rounded-xl border border-outline-variant/40 shadow-lg p-12 text-center max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">event_busy</span>
            </div>
            <h2 className="text-lg font-bold text-primary">Cổng đăng ký trực tuyến tạm đóng</h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Hiện tại Hiệp hội HOBA LPG đang tạm ngừng tiếp nhận hồ sơ đăng ký hội viên trực tuyến mới để tiến hành bảo trì hoặc sắp xếp thủ tục. 
              Mọi thắc mắc xin vui lòng quay lại sau hoặc liên hệ Hotline hỗ trợ của chúng tôi bên dưới.
            </p>
            <div className="pt-4 border-t border-outline-variant/20 flex flex-col items-center gap-2">
              <span className="text-[10px] text-on-surface-variant">Hotline hỗ trợ khẩn cấp:</span>
              <a href={`tel:${pageConfig.hotline}`} className="text-base font-bold text-[#bb0013] hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">call</span> {pageConfig.hotline}
              </a>
            </div>
            <div className="pt-4">
              <Link href="/" className="inline-block bg-[#00346f] hover:bg-[#00346f]/90 text-white px-6 py-2.5 rounded-full font-bold text-[10px] shadow transition-all active:scale-95 duration-200">
                Quay về Trang chủ
              </Link>
            </div>
          </div>
        ) : (
          /* Multi-step Form Container */
          <div className="bg-white rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden">
          {/* Progress Stepper */}
          <div className="bg-surface-container/50 px-8 py-6 border-b border-outline-variant/30">
            <div className="flex justify-between relative">
              <div className="absolute top-5 left-0 w-full h-0.5 bg-outline-variant -z-0"></div>
              <div
                className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 -z-0"
                style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
              ></div>

              {stepLabels.map((s) => (
                <div key={s.number} className="relative z-10 flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all border-4 border-surface-container ${
                      currentStep >= s.number
                        ? 'bg-primary text-white'
                        : 'bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    {currentStep > s.number ? (
                      <span className="material-symbols-outlined text-sm">check</span>
                    ) : (
                      s.number
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      currentStep >= s.number ? 'text-primary font-bold' : 'text-on-surface-variant'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <form className="p-8 md:p-12" onSubmit={handleSubmit}>
            {/* Step 1: Business Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2 border-b border-outline-variant/20 pb-2">
                  <span className="material-symbols-outlined">business</span> Thông tin doanh nghiệp
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-on-surface-variant">Tên doanh nghiệp (Tiếng Việt) *</label>
                    <input
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="h-12 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Công ty TNHH LPG Việt Nam"
                      required
                      type="text"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-on-surface-variant">Mã số thuế *</label>
                    <input
                      name="taxCode"
                      value={formData.taxCode}
                      onChange={handleInputChange}
                      className="h-12 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="0123456789"
                      required
                      type="text"
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-2">
                    <label className="text-xs font-bold text-on-surface-variant">Địa chỉ trụ sở chính *</label>
                    <input
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="h-12 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Số 123 Đường ABC, Quận 1, TP. Hồ Chí Minh"
                      required
                      type="text"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-on-surface-variant">Số điện thoại doanh nghiệp *</label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="h-12 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="028 1234 5678"
                      required
                      type="tel"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-on-surface-variant">Lĩnh vực hoạt động</label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                      className="h-12 border border-outline-variant rounded-lg px-4 bg-white text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="Sản xuất & Chiết nạp">Sản xuất & Chiết nạp</option>
                      <option value="Vận chuyển LPG">Vận chuyển LPG</option>
                      <option value="Phân phối & Bán lẻ">Phân phối & Bán lẻ</option>
                      <option value="Dịch vụ kỹ thuật">Dịch vụ kỹ thuật</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-xs font-bold text-on-surface-variant">Logo doanh nghiệp (ảnh màu)</label>
                    <div className="flex items-center gap-4 bg-surface-container-low/30 p-3 rounded-lg border border-outline-variant/20">
                      <div className="w-16 h-16 rounded overflow-hidden border border-outline-variant/30 bg-white flex items-center justify-center flex-shrink-0 relative">
                        {formData.logoUrl ? (
                          <img src={formData.logoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                        ) : (
                          <span className="material-symbols-outlined text-outline text-lg">image</span>
                        )}
                      </div>
                      <div className="flex-grow flex flex-col gap-1.5">
                        <div className="flex gap-2">
                          <input
                            name="logoUrl"
                            value={formData.logoUrl}
                            onChange={handleInputChange}
                            className="flex-grow h-10 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            placeholder="Dán URL ảnh hoặc tải lên..."
                            type="text"
                          />
                          <label className="h-10 px-4 bg-secondary text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 hover:bg-[#93000d] cursor-pointer transition-colors active:scale-95">
                            <span className="material-symbols-outlined text-base">cloud_upload</span>
                            {logoUploading ? 'Đang tải...' : 'Tải lên'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUploadChange(e, 'logoUrl', setLogoUploading)}
                              disabled={logoUploading}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Representative Info */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2 border-b border-outline-variant/20 pb-2">
                  <span className="material-symbols-outlined">person</span> Thông tin người đại diện
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-on-surface-variant">Họ và tên người đại diện *</label>
                    <input
                      name="repName"
                      value={formData.repName}
                      onChange={handleInputChange}
                      className="h-12 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Nguyễn Văn A"
                      required
                      type="text"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-on-surface-variant">Chức vụ *</label>
                    <input
                      name="repRole"
                      value={formData.repRole}
                      onChange={handleInputChange}
                      className="h-12 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Giám đốc điều hành"
                      required
                      type="text"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-on-surface-variant">Email liên hệ *</label>
                    <input
                      name="repEmail"
                      value={formData.repEmail}
                      onChange={handleInputChange}
                      className="h-12 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="ceo@company.com"
                      required
                      type="email"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-on-surface-variant">Số điện thoại di động *</label>
                    <input
                      name="repPhone"
                      value={formData.repPhone}
                      onChange={handleInputChange}
                      className="h-12 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="090 1234 567"
                      required
                      type="tel"
                    />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-xs font-bold text-on-surface-variant">Ảnh chân dung người đại diện (ảnh người)</label>
                    <div className="flex items-center gap-4 bg-surface-container-low/30 p-3 rounded-lg border border-outline-variant/20">
                      <div className="w-16 h-16 rounded-full overflow-hidden border border-outline-variant/30 bg-white flex items-center justify-center flex-shrink-0 relative">
                        {formData.repAvatarUrl ? (
                          <img src={formData.repAvatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-outline text-lg">person</span>
                        )}
                      </div>
                      <div className="flex-grow flex flex-col gap-1.5">
                        <div className="flex gap-2">
                          <input
                            name="repAvatarUrl"
                            value={formData.repAvatarUrl}
                            onChange={handleInputChange}
                            className="flex-grow h-10 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            placeholder="Dán URL ảnh hoặc tải lên..."
                            type="text"
                          />
                          <label className="h-10 px-4 bg-secondary text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 hover:bg-[#93000d] cursor-pointer transition-colors active:scale-95">
                            <span className="material-symbols-outlined text-base">cloud_upload</span>
                            {repAvatarUploading ? 'Đang tải...' : 'Tải lên'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUploadChange(e, 'repAvatarUrl', setRepAvatarUploading)}
                              disabled={repAvatarUploading}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Legal Documents */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-primary mb-2 flex items-center gap-2 border-b border-outline-variant/20 pb-2">
                  <span className="material-symbols-outlined">upload_file</span> Đính kèm hồ sơ pháp lý
                </h3>
                <p className="text-xs text-on-surface-variant -mt-4 mb-4">
                  Vui lòng tải lên các bản quét (scan) rõ nét định dạng PDF hoặc JPG (Tối đa 5MB/file).
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* File 1 */}
                  <label className="border-2 border-dashed border-outline-variant rounded-xl p-6 flex flex-col items-center text-center gap-3 hover:border-primary transition-colors cursor-pointer group bg-surface">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant group-hover:text-primary">
                      description
                    </span>
                    <div>
                      <p className="text-xs font-bold text-on-surface">Giấy phép đăng ký kinh doanh *</p>
                      <p className="text-[10px] text-on-surface-variant mt-1">
                        {formData.licenseFileName ? `Đã chọn: ${formData.licenseFileName}` : 'Kéo thả hoặc bấm để chọn file'}
                      </p>
                    </div>
                    <input
                      className="hidden"
                      type="file"
                      onChange={(e) => handleFileChange(e, 'licenseFile')}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </label>
                  {/* File 2 */}
                  <label className="border-2 border-dashed border-outline-variant rounded-xl p-6 flex flex-col items-center text-center gap-3 hover:border-primary transition-colors cursor-pointer group bg-surface">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant group-hover:text-primary">
                      verified_user
                    </span>
                    <div>
                      <p className="text-xs font-bold text-on-surface">Chứng chỉ an toàn LPG *</p>
                      <p className="text-[10px] text-on-surface-variant mt-1">
                        {formData.safetyFileName ? `Đã chọn: ${formData.safetyFileName}` : 'Kéo thả hoặc bấm để chọn file'}
                      </p>
                    </div>
                    <input
                      className="hidden"
                      type="file"
                      onChange={(e) => handleFileChange(e, 'safetyFile')}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 4 && (
              <div className="space-y-6 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl">task_alt</span>
                </div>
                <h3 className="text-lg font-bold text-primary">Xác nhận thông tin</h3>
                <p className="text-xs text-on-surface-variant max-w-lg leading-relaxed">
                  Vui lòng rà soát lại toàn bộ thông tin đã nhập trước khi gửi hồ sơ. Sau khi gửi, bộ phận thẩm
                  định của HOBA sẽ phản hồi trong vòng 3-5 ngày làm việc.
                </p>
                <div className="w-full bg-surface-container rounded-lg p-6 text-left border border-outline-variant/30 text-xs space-y-3">
                  <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                    <span className="font-bold text-on-surface-variant">Tên đơn vị:</span>
                    <span className="font-semibold text-right">{formData.companyName}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                    <span className="font-bold text-on-surface-variant">Mã số thuế:</span>
                    <span className="font-semibold text-right">{formData.taxCode}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                    <span className="font-bold text-on-surface-variant">Loại hình:</span>
                    <span className="font-semibold text-right">{formData.businessType}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                    <span className="font-bold text-on-surface-variant">Người đại diện:</span>
                    <span className="font-semibold text-right">{formData.repName} - {formData.repRole}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-on-surface-variant">Hồ sơ đính kèm:</span>
                    <span className="font-semibold text-primary text-right">
                      {formData.licenseFileName || 'Chưa chọn'} | {formData.safetyFileName || 'Chưa chọn'}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-left mt-4 max-w-xl">
                  <input
                    className="mt-1 border-outline-variant rounded"
                    id="termsAccepted"
                    name="termsAccepted"
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={handleInputChange}
                  />
                  <label className="text-xs text-on-surface-variant leading-relaxed" htmlFor="termsAccepted">
                    {pageConfig.agreementText}
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-12 flex justify-between pt-8 border-t border-outline-variant/30">
              <button
                className={`px-8 py-3 rounded-lg border-2 border-primary text-primary font-bold text-xs hover:bg-primary/5 transition-all active:scale-95 flex items-center gap-2 ${
                  currentStep === 1 ? 'invisible' : ''
                }`}
                id="prev-btn"
                type="button"
                onClick={handleBack}
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span> Quay lại
              </button>
              <div className="ml-auto flex gap-4">
                {currentStep < totalSteps ? (
                  <button
                    className="px-10 py-3 rounded-lg bg-primary text-white font-bold text-xs hover:bg-primary-container transition-all active:scale-95 flex items-center gap-2"
                    id="next-btn"
                    type="button"
                    onClick={handleNext}
                  >
                    Tiếp theo <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                ) : (
                  <button
                    className="px-10 py-3 rounded-lg bg-secondary text-white font-bold text-xs hover:bg-[#93000d] shadow-lg transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                    id="submit-btn"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        Gửi hồ sơ <span className="material-symbols-outlined text-sm">send</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
        )}

        {/* Help Section */}
        <div className="mt-8 flex flex-col md:flex-row gap-6 justify-center items-center text-on-surface-variant text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">support_agent</span>
            <span>Cần hỗ trợ? <strong>{pageConfig.hotline}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">security</span>
            <span>Thông tin được bảo mật theo tiêu chuẩn ISO 27001</span>
          </div>
        </div>
      </main>
    </div>
  );
}
