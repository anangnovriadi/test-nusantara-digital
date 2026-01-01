'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <button
        onClick={() => router.push('/admin')}
        className="px-6 py-3 rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
      >
        Go to Admin
      </button>
    </div>
  );
}
