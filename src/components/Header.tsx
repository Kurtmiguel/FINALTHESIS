import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  return (
    <header className="bg-primary text-quaternary p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"  // Replace with your actual logo path
            alt="Logo"
            width={40}
            height={40}
            className="mr-2"
          />
          <span className="text-2xl font-bold">Your System Name</span>
        </Link>
        <nav>
          <Link href="/login" className="mr-4">Login</Link>
          <Link href="/register">Register</Link>
        </nav>
      </div>
    </header>
  );
}