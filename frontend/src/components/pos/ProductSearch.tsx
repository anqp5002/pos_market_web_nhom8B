"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ScanBarcode } from "lucide-react";

interface ProductSearchProps {
  onSearch: (query: string) => void;
  onBarcodeSubmit: (barcode: string) => void;
}

export default function ProductSearch({
  onSearch,
  onBarcodeSubmit,
}: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [isBarcodeMode, setIsBarcodeMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus ở barcode mode (mô phỏng scanner)
  useEffect(() => {
    if (isBarcodeMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isBarcodeMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (!isBarcodeMode) {
      onSearch(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isBarcodeMode && query.trim()) {
      onBarcodeSubmit(query.trim());
      setQuery("");
    }
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={
            isBarcodeMode
              ? "Quét hoặc nhập mã vạch rồi Enter..."
              : "Tìm sản phẩm theo tên..."
          }
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        />
      </div>
      <button
        onClick={() => {
          setIsBarcodeMode(!isBarcodeMode);
          setQuery("");
          onSearch("");
        }}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
          isBarcodeMode
            ? "bg-blue-600 text-white shadow-md"
            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
      >
        <ScanBarcode className="w-4 h-4" />
        <span className="hidden sm:inline">Mã vạch</span>
      </button>
    </div>
  );
}
