
import Link from 'next/link';
import Image from 'next/image';

export default function HomepageComponent() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-950 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/brgylogo.png"  
              alt="Logo"
              width={40}
              height={40}
              className="mr-2"
              priority={true}
            />
            <span className="text-2xl font-bold">Barangay Canine Management System</span>
          </Link>
          <nav>
            <Link href="/login" className="mr-4">Login</Link>
            <Link href="/register">Register</Link>
          </nav>
        </div>
      </header>
      <main className="flex-grow bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">Welcome to the Barangay Canine Management System</h1>
          <p className="text-2xl">
            Our system helps you manage and monitor the canine population in your barangay with ease. 
            Track registrations, monitor health, and keep your community's dogs safe and well-cared-for.
          </p>
        </div>
      </main>
      <footer className="bg-blue-950 text-white p-4 text-center">
        <p>&copy; {new Date().getFullYear()} Barangay Canine Management System</p>
      </footer>
    </div>
  );
}
