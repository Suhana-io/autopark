import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import {
  FaCar, FaParking, FaQrcode,
  FaMoneyBillWave, FaShieldAlt, FaClock
} from 'react-icons/fa'

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-blue-700 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <FaCar className="text-yellow-400 text-6xl md:text-7xl" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Welcome to{' '}
            <span className="text-yellow-400">AutoPark</span>
          </h1>
          <p className="text-base md:text-xl text-blue-100 
                        mb-8 max-w-2xl mx-auto">
            Smart Parking Management System — Book your parking
            slot instantly, hassle free, anytime anywhere!
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link
              to="/register"
              className="bg-yellow-400 text-blue-900
                         hover:bg-yellow-300 px-6 py-3
                         rounded-xl font-bold text-base
                         md:text-lg transition w-full
                         sm:w-auto text-center"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-white text-blue-700
                         hover:bg-blue-50 px-6 py-3
                         rounded-xl font-bold text-base
                         md:text-lg transition w-full
                         sm:w-auto text-center"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold 
                         text-center text-gray-800 mb-8">
            Why Choose AutoPark?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 
                          md:grid-cols-3 gap-6">

            <div className="bg-white rounded-2xl shadow p-6 
                            text-center hover:shadow-xl transition">
              <FaParking className="text-blue-600 text-4xl 
                                   mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Easy Slot Booking
              </h3>
              <p className="text-gray-500 text-sm">
                Book your parking slot in seconds. Choose your
                preferred slot type, floor and time.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow p-6
                            text-center hover:shadow-xl transition">
              <FaQrcode className="text-green-600 text-4xl
                                  mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                QR Code Entry
              </h3>
              <p className="text-gray-500 text-sm">
                Get a unique QR code for every booking.
                Show it at entry for quick and secure access.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow p-6
                            text-center hover:shadow-xl transition">
              <FaMoneyBillWave className="text-yellow-500 text-4xl
                                         mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Easy Payments
              </h3>
              <p className="text-gray-500 text-sm">
                Pay via Cash, Card or UPI. Get instant
                payment confirmation and receipts.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow p-6
                            text-center hover:shadow-xl transition">
              <FaShieldAlt className="text-purple-600 text-4xl
                                     mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Secure & Safe
              </h3>
              <p className="text-gray-500 text-sm">
                Your data is protected with JWT authentication
                and encrypted passwords.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow p-6
                            text-center hover:shadow-xl transition">
              <FaClock className="text-red-500 text-4xl
                                 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Real-time Updates
              </h3>
              <p className="text-gray-500 text-sm">
                Get live updates on slot availability.
                No more guessing — see what's free instantly.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow p-6
                            text-center hover:shadow-xl transition">
              <FaCar className="text-blue-400 text-4xl
                               mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Multiple Vehicle Types
              </h3>
              <p className="text-gray-500 text-sm">
                Support for Cars, Bikes and Trucks with
                different pricing for each type.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-blue-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold
                         text-center text-gray-800 mb-8">
            How It Works
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {[
              { step: '1', title: 'Register', desc: 'Create your free account' },
              { step: '2', title: 'Choose Slot', desc: 'Pick your parking slot' },
              { step: '3', title: 'Pay & Book', desc: 'Complete payment & get QR' },
              { step: '4', title: 'Park & Go', desc: 'Show QR and park!' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="bg-blue-700 text-white w-12 h-12
                                rounded-full flex items-center
                                justify-center text-xl font-bold
                                mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-800 mb-1 text-sm md:text-base">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-xs md:text-sm">
                  {item.desc}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-700 text-white py-12 px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Ready to Park Smart?
        </h2>
        <p className="text-blue-100 mb-6 text-base md:text-lg">
          Join thousands of users who use AutoPark every day
        </p>
        <Link
          to="/register"
          className="bg-yellow-400 text-blue-900
                     hover:bg-yellow-300 px-8 py-3
                     rounded-xl font-bold text-lg transition
                     inline-block"
        >
          Register for Free
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-center py-6 px-4">
        <p>© 2024 AutoPark - Smart Parking Management System</p>
        <p className="text-sm mt-1">Built with ❤️ using React & Node.js</p>
      </footer>

    </div>
  )
}

export default Home