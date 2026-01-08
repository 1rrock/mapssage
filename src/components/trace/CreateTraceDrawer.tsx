'use client';

import { useState, useRef } from 'react';
import { Drawer } from 'vaul';
import { toast } from 'sonner';
import { useCreateTrace, useUploadImage } from '@/hooks/useTraces';
import useCurrentLocation from '@/hooks/useCurrentLocation';

interface CreateTraceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateTraceDrawer({
  open,
  onOpenChange,
}: CreateTraceDrawerProps) {
  const { location } = useCurrentLocation();
  const createTrace = useCreateTrace();
  const uploadImage = useUploadImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('이미지 크기는 10MB 이하여야 합니다');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('제목을 입력해주세요');
      return;
    }

    if (!content.trim()) {
      toast.error('내용을 입력해주세요');
      return;
    }

    if (!location) {
      toast.error('위치 정보를 가져올 수 없습니다');
      return;
    }

    try {
      let imageUrl: string | undefined;

      if (imageFile) {
        toast.loading('이미지 업로드 중...', { id: 'upload' });
        imageUrl = await uploadImage.mutateAsync(imageFile);
        toast.dismiss('upload');
      }

      await createTrace.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        imageUrl,
        latitude: location.latitude,
        longitude: location.longitude,
      });

      toast.success('메시지가 생성되었습니다');
      setTitle('');
      setContent('');
      setImageFile(null);
      setImagePreview(null);
      onOpenChange(false);
    } catch {
      toast.dismiss('upload');
      toast.error('메시지 생성에 실패했습니다');
    }
  };

  const handleClose = () => {
    if (title || content || imageFile) {
      if (confirm('작성 중인 내용이 있습니다. 취소하시겠습니까?')) {
        setTitle('');
        setContent('');
        setImageFile(null);
        setImagePreview(null);
        onOpenChange(false);
      }
    } else {
      onOpenChange(false);
    }
  };

  const isSubmitting = createTrace.isPending || uploadImage.isPending;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex max-h-[90vh] flex-col rounded-t-2xl bg-white shadow-xl">
          <div className="mx-auto mt-4 h-1.5 w-12 flex-shrink-0 rounded-full bg-gray-300" />

          <div className="flex-1 overflow-y-auto p-6 bg-[#FFF1E6]/30">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border-b-2 border-[#E5D5C5] bg-transparent pb-3 text-2xl font-black text-[#264653] placeholder:text-[#264653]/30 focus:border-[#FF5A5F] focus:outline-none transition-colors"
                  placeholder="제목을 입력하세요"
                  disabled={isSubmitting}
                  maxLength={100}
                />
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isSubmitting}
                />

                {imagePreview ? (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-56 w-full rounded-2xl object-cover shadow-md border-2 border-white"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={isSubmitting}
                      className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-all shadow-lg opacity-0 group-hover:opacity-100"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                    className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#E5D5C5] bg-white/50 py-10 text-[#264653]/50 transition-all hover:border-[#FF5A5F] hover:text-[#FF5A5F] hover:bg-white disabled:opacity-50 group"
                  >
                    <div className="p-3 rounded-full bg-[#FF5A5F]/5 group-hover:bg-[#FF5A5F]/10 transition-colors">
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold tracking-tight">이미지 추가하기</span>
                  </button>
                )}
              </div>

              <div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full resize-none rounded-2xl border-2 border-[#E5D5C5] bg-white p-4 text-lg font-medium text-[#264653] placeholder:text-[#264653]/30 focus:border-[#FF5A5F] focus:outline-none focus:ring-0 transition-all shadow-inner"
                  placeholder="이곳에 따뜻한 마음을 담은 메시지를 작성하세요..."
                  disabled={isSubmitting}
                  maxLength={1000}
                />
                <p className="mt-2 text-right text-xs font-bold text-[#264653]/40">
                  {content.length}/1000
                </p>
              </div>

              {location && (
                <div className="flex items-center gap-3 rounded-xl bg-[#264653]/5 px-4 py-3 text-sm font-bold text-[#264653]">
                  <span className="text-lg">📬</span>
                  <span>현재 위치에서 메시지가 배달됩니다</span>
                </div>
              )}
            </form>
          </div>

          <div className="border-t border-[#E5D5C5]/30 p-6 bg-white">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 rounded-2xl bg-[#F3E5D8] py-4 text-base font-black text-[#264653] transition-all hover:bg-[#EBDBCB] active:scale-[0.98] disabled:opacity-50"
              >
                나중에 담기
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim() || !content.trim()}
                className="flex-[2] rounded-2xl bg-[#FF5A5F] py-4 text-base font-black text-white shadow-lg transition-all hover:bg-[#FF454A] active:scale-[0.98] disabled:bg-gray-300"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    전송 중...
                  </span>
                ) : (
                  '메시지 남기기'
                )}
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
