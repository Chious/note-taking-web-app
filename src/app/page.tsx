import { LoginForm } from "@/components/auth";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        {message && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-center">
            {message}
          </div>
        )}
        <LoginForm redirectTo="/dashboard/notes" />
      </div>
    </main>
  );
}
