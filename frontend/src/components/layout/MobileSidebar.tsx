"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings, Menu, X } from "lucide-react";
import SidebarNav from "./SidebarNav";

interface MobileSidebarProps {
  isAdmin: boolean;
}

export default function MobileSidebar({ isAdmin }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 -ml-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-md md:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col transform transition-transform duration-200 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">POS System</h1>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav isAdmin={isAdmin} onItemClick={() => setIsOpen(false)} />
        </div>
        
        <div className="p-4 border-t">
          <Link 
            href="/settings" 
            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="w-5 h-5" />
            <span>Cài Đặt</span>
          </Link>
        </div>
      </div>
    </>
  );
}
