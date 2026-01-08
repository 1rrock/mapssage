'use client';

import { useMyTraces, useDeleteTrace, useRestoreTrace, useUploadImage } from '@/hooks/useTraces';
import { useProfile, useUpdateProfile, useDeleteAccount } from '@/hooks/useProfile';
import { signOut, useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

function ProfileSection() {
  const { data: session } = useSession();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadImage = useUploadImage();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameEdit = () => {
    setNewName(profile?.name || '');
    setIsEditingName(true);
  };

  const handleNameSave = async () => {
    if (!newName.trim()) {
      toast.error('닉네임을 입력해주세요');
      return;
    }

    try {
      await updateProfile.mutateAsync({ name: newName.trim() });
      toast.success('닉네임이 변경되었습니다');
      setIsEditingName(false);
    } catch {
      toast.error('닉네임 변경에 실패했습니다');
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const imageUrl = await uploadImage.mutateAsync(file);
      await updateProfile.mutateAsync({ image: imageUrl });
      toast.success('프로필 이미지가 변경되었습니다');
    } catch {
      toast.error('이미지 업로드에 실패했습니다');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <section className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
      <div className="relative mb-6 group">
        <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-black shadow-md transition-transform transform group-hover:scale-105">
          <img
            src={profile?.image || session?.user?.image || '/default-avatar.png'}
            alt="프로필"
            className="h-full w-full object-cover"
          />
          {isUploadingImage && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <svg className="h-8 w-8 text-white animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingImage}
          className="absolute bottom-1 right-1 p-2 rounded-full bg-white shadow-lg border border-gray-200 text-gray-600 hover:text-primary hover:border-primary transition-all"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      <div className="w-full max-w-xs space-y-2">
        {isEditingName ? (
          <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-center text-lg font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="새 닉네임"
              autoFocus
            />
            <button
              onClick={handleNameSave}
              disabled={updateProfile.isPending}
              className="rounded-xl bg-black px-4 py-2 font-medium text-white hover:bg-black/90 transition-colors"
            >
              저장
            </button>
            <button
              onClick={() => setIsEditingName(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 font-medium hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 group">
            <h2 className="text-2xl font-bold text-gray-900">
              {profile?.name || session?.user?.name || '이름 없음'}
            </h2>
            <button
              onClick={handleNameEdit}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        )}
        <p className="text-gray-500 font-medium">{profile?.email || session?.user?.email}</p>
      </div>
    </section>
  );
}

function AccountSection({ onDeleteClick }: { onDeleteClick: () => void }) {
  return (
    <div className="flex flex-wrap justify-end gap-3 mt-4">
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="rounded-xl px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
      >
        로그아웃
      </button>
      <div className="w-px h-4 bg-gray-300 self-center" />
      <button
        onClick={onDeleteClick}
        className="rounded-xl px-4 py-2 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
      >
        회원 탈퇴
      </button>
    </div>
  );
}

function DeleteAccountModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const deleteAccount = useDeleteAccount();
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (confirmText !== '회원탈퇴') {
      toast.error('"회원탈퇴"를 정확히 입력해주세요');
      return;
    }

    try {
      await deleteAccount.mutateAsync();
      toast.success('회원 탈퇴가 완료되었습니다');
      signOut({ callbackUrl: '/' });
    } catch {
      toast.error('회원 탈퇴에 실패했습니다');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">정말 탈퇴하시겠습니까?</h3>
          <p className="mt-2 text-sm text-gray-500">
            모든 데이터가 삭제되며 복구할 수 없습니다.<br />
            계속하려면 <strong>&quot;회원탈퇴&quot;</strong>를 입력해주세요.
          </p>
        </div>

        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-center focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          placeholder="회원탈퇴"
        />

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => {
              onClose();
              setConfirmText('');
            }}
            className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteAccount.isPending || confirmText !== '회원탈퇴'}
            className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {deleteAccount.isPending ? '처리 중...' : '탈퇴하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TraceListSection() {
  const [showDeleted, setShowDeleted] = useState(false);
  const { data: traces, isLoading } = useMyTraces(showDeleted);
  const deleteTrace = useDeleteTrace();
  const restoreTrace = useRestoreTrace();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('정말 이 메시지을 삭제하시겠습니까?')) return;

    setProcessingId(id);
    try {
      await deleteTrace.mutateAsync(id);
      toast.success('메시지이 삭제되었습니다');
    } catch {
      toast.error('삭제에 실패했습니다');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRestore = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setProcessingId(id);
    try {
      await restoreTrace.mutateAsync(id);
      toast.success('메시지이 복구되었습니다');
    } catch {
      toast.error('복구에 실패했습니다');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <section className="mt-8">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  const activeTraces = traces?.filter((t) => !t.isDeleted) || [];
  const deletedTraces = traces?.filter((t) => t.isDeleted) || [];
  const displayTraces = showDeleted ? deletedTraces : activeTraces;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">내 메시지</h2>
          <span className="bg-black px-2.5 py-0.5 rounded-full text-xs font-bold text-white">
            {displayTraces.length}
          </span>
        </div>
        <button
          onClick={() => setShowDeleted(!showDeleted)}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-semibold transition-all shadow-sm border",
            showDeleted
              ? "bg-gray-800 text-white border-gray-800 hover:bg-gray-900"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          )}
        >
          {showDeleted ? '활성 메시지 보기' : '휴지통'}
        </button>
      </div>

      {displayTraces.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center min-h-[300px]">
          <div className="mb-4 text-5xl opacity-50">{showDeleted ? '🗑️' : '📍'}</div>
          <p className="text-lg font-medium text-gray-900">
            {showDeleted ? '삭제된 메시지이 없습니다' : '아직 남긴 메시지이 없습니다'}
          </p>
          {!showDeleted && (
            <p className="mt-2 text-sm text-gray-500">
              지금 바로 지도에서 이야기를 시작해보세요!
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayTraces.map((trace) => (
            <div
              key={trace.id}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-1",
                trace.isDeleted ? "border-red-100 bg-red-50/10" : "border-gray-100"
              )}
            >
              {trace.imageUrl && (
                <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                  <img
                    src={trace.imageUrl}
                    alt={trace.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-lg font-bold text-white line-clamp-1 text-shadow-sm">
                      {trace.title}
                    </h3>
                  </div>
                </div>
              )}

              <div className="flex flex-1 flex-col p-5">
                {!trace.imageUrl && (
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                    {trace.title}
                  </h3>
                )}

                <p className="mb-4 line-clamp-3 text-sm text-gray-600 flex-1 leading-relaxed">
                  {trace.content}
                </p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-xs font-medium text-gray-400">
                    {new Date(trace.createdAt).toLocaleDateString()}
                  </span>

                  {trace.isDeleted ? (
                    <button
                      onClick={(e) => handleRestore(trace.id, e)}
                      disabled={processingId === trace.id}
                      className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-200 transition-colors"
                    >
                      {processingId === trace.id ? '...' : '복구'}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleDelete(trace.id, e)}
                      disabled={processingId === trace.id}
                      className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                    >
                      {processingId === trace.id ? '...' : '삭제'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function MyPage() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-10">
      <div className="bg-[#E3E3E3]/50 h-64 w-full absolute top-0 left-0 -z-10" />
      <div className="mx-auto max-w-5xl px-4 pt-24">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-black tracking-tighter">마이페이지</h1>
          <p className="text-black/60 mt-2 font-medium">나의 활동과 추억을 관리해보세요.</p>
        </div>

        <div className="space-y-6">
          <ProfileSection />
          <TraceListSection />
          <AccountSection onDeleteClick={() => setShowDeleteModal(true)} />
        </div>

        <DeleteAccountModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        />
      </div>
    </div>
  );
}
