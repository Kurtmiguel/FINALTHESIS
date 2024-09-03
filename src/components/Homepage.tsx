import Header from './Header';
import Footer from './Footer';

export default function HomepageComponent() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header/>
      <main className="flex-grow bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">Welcome to the Barangay Canine Management System</h1>
          <p className="text-2xl">
            Our system helps you manage and monitor the canine population in your barangay with ease. 
            Track registrations, monitor health, and keep your community's dogs safe and well-cared-for.
          </p>
        </div>
      </main>
      <Footer/>
    </div>
  );
}
