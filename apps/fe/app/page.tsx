import React from 'react';
import { Pencil, Share2, Users, Sparkles, Github } from 'lucide-react';
import Link from 'next/link';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Navigation */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold">Sketch</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href={"/signin"}  className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors">
                Log in
              </Link >
              <Link href={"/signup"} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Create, Collaborate, and Share Your Ideas
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            A simple yet powerful whiteboard for teams to sketch, diagram, and illustrate ideas together.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href={"/signin"} className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-medium">
              Start Drawing
            </Link>
            
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-xl bg-gray-800">
              <Pencil className="h-8 w-8 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Simple Drawing Tools</h3>
              <p className="text-gray-400">
                Intuitive tools for creating diagrams, sketches, and illustrations quickly.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-gray-800">
              <Share2 className="h-8 w-8 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Easy Sharing</h3>
              <p className="text-gray-400">
                Share your drawings with a simple link or export them in various formats.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-gray-800">
              <Users className="h-8 w-8 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-time Collaboration</h3>
              <p className="text-gray-400">
                Work together with your team in real-time on the same canvas.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-gray-800">
              <Sparkles className="h-8 w-8 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Features</h3>
              <p className="text-gray-400">
                Advanced features like shape recognition and automatic layouts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              © 2025 Sketch. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-400 hover:text-gray-300">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-gray-300">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-gray-300">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;