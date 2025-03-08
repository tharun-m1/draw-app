import { LogOut, UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation';
import React from 'react'

function Header() {
  const router = useRouter()
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/")
  }
  return (
    <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="ml-2 text-xl font-bold text-gray-100">
                Sketch
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {/* <button
                className="text-gray-400 hover:text-gray-300 transition-colors"
                
              >
                <UserIcon className="h-5 w-5" />
              </button> */}
              <button
                className="text-gray-400 hover:text-gray-300 transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
  )
}

export default Header
