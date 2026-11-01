import { notFound } from 'next/navigation';
import { DesignGallery } from '@/features/design/DesignGallery';
export default function Page() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <DesignGallery />;
}
