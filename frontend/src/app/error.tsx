'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 space-y-6">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600">
        <AlertCircle className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Đã xảy ra lỗi!</h2>
        <p className="text-gray-500 max-w-md">
          {error.message || 'Không thể tải trang này. Vui lòng kiểm tra lại kết nối và thử lại.'}
        </p>
      </div>
      <div className="flex gap-4">
        <Button onClick={() => reset()} className="bg-blue-600 hover:bg-blue-700">
          Thử lại
        </Button>
        <Button variant="outline" onClick={() => window.location.href = '/'}>
          Về trang chủ
        </Button>
      </div>
    </div>
  );
}
