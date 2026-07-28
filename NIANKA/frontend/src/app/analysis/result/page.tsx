"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AnalysisResultPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/user/analysis/result');
  }, [router]);

  return null;
}
