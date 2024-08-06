import Link from 'next/link';
import Image from 'next/image';

const UserDashboard = () => {
    return(
        <div>
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
                </div>
            </header>
            <footer className="bg-blue-950 text-white p-4 text-center">
                <p>&copy; {new Date().getFullYear()} Barangay Canine Management System</p>
            </footer>
        </div>
    );
};

export default UserDashboard;