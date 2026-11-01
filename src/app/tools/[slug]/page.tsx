import { notFound } from 'next/navigation';
import { toolsList } from '@/lib/colors';
import Workspace from '@/components/workspace';
export function generateStaticParams() { return toolsList.map(t => ({ slug: t.slug })); }
export async function generateMetadata({ params }: {
    params: Promise<{
        slug: string;
    }>;
}) { const { slug } = await params; const t = toolsList.find(t => t.slug === slug); return { title: t?.name || 'Tool', description: t?.description }; }
export default async function Page({ params }: {
    params: Promise<{
        slug: string;
    }>;
}) { const { slug } = await params; if (!toolsList.some(t => t.slug === slug))
    notFound(); return <Workspace slug={slug}/>; }
