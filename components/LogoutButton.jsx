'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login'); // or wherever you want to redirect
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}
