import AdminApp from '@/components/AdminApp';

export default function AdminPage({ searchParams }: { searchParams: { key?: string } }) {
  // middleware.ts already verified searchParams.key === process.env.ADMIN_KEY
  return <AdminApp adminKey={searchParams.key ?? ''} />;
}
