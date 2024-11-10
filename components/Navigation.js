'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import { useState, useEffect, useRef } from 'react';

function NavLink({ href, children, onClick }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`w-full md:w-auto px-4 py-2 rounded-lg transition-colors ${
        isActive 
          ? 'bg-purple-100 text-purple-700' 
          : 'hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  );
}

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu when screen size changes to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsMenuOpen(false);
      }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="w-full py-4 border-b relative" ref={menuRef}>
      <div className="flex flex-row justify-between items-center">
        <div className="flex items-center">
          <Logo />
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <NavLink href="/tools/meme-battle">Meme Battle</NavLink>
          <NavLink href="/tools/volume-hunter">Volume Hunter</NavLink>
          <NavLink href="/tools/usd-converter">USD Converter</NavLink>
          <NavLink href="/tools/moon-calculator">Moon Calculator</NavLink>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className="w-6 h-6"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          ) : (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className="w-6 h-6"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" 
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b shadow-lg md:hidden z-50 mt-4 rounded-lg mx-4">
          <div className="flex flex-col p-4 gap-2">
            <NavLink href="/tools/meme-battle" onClick={closeMenu}>Meme Battle</NavLink>
            <NavLink href="/tools/volume-hunter" onClick={closeMenu}>Volume Hunter</NavLink>
            <NavLink href="/tools/usd-converter" onClick={closeMenu}>USD Converter</NavLink>
            <NavLink href="/tools/moon-calculator" onClick={closeMenu}>Moon Calculator</NavLink>
          </div>
        </div>
      )}
    </nav>
  );
} 