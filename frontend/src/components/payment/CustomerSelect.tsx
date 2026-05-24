"use client";

import { useState, useEffect } from "react";
import { User, Search } from "lucide-react";
import { apiFetch, getClientToken } from "@/lib/api";

interface Customer {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
}

interface CustomerSelectProps {
  value: number | null;
  onChange: (customerId: number | null) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function CustomerSelect({ value, onChange }: CustomerSelectProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Fetch danh sách khách hàng từ API
  useEffect(() => {
    getClientToken()
      .then((token) => {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        return apiFetch<{ data: Customer[] }>("/customers", { headers });
      })
      .then((data) => setCustomers(data.data || []))
      .catch(() => setCustomers([]));
  }, []);

  // Lọc khách hàng theo tên hoặc SĐT
  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  const selected = customers.find((c) => c.id === value);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
        <User className="w-4 h-4" />
        Khách hàng
      </label>

      <div className="relative">
        {/* Input tìm kiếm */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={selected ? selected.name : "Tìm khách hàng (tên, SĐT)..."}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                       bg-white placeholder:text-gray-400 transition-all"
          />
        </div>

        {/* Dropdown danh sách */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {/* Khách vãng lai */}
            <button
              onClick={() => {
                onChange(null);
                setSearch("");
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 transition-colors border-b border-gray-100 ${
                value === null ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600"
              }`}
            >
              👤 Khách vãng lai
            </button>

            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-400 text-center">
                Không tìm thấy khách hàng
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onChange(c.id);
                    setSearch("");
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors ${
                    value === c.id ? "bg-blue-50 text-blue-700" : ""
                  }`}
                >
                  <p className="text-sm font-medium text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-500">
                    {c.phone || "Không có SĐT"} {c.email ? `• ${c.email}` : ""}
                  </p>
                </button>
              ))
            )}
          </div>
        )}

        {/* Click bên ngoài để đóng dropdown */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>

      {/* Hiển thị khách đã chọn */}
      {selected && (
        <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
          <div>
            <p className="text-sm font-medium text-blue-800">{selected.name}</p>
            <p className="text-xs text-blue-600">{selected.phone}</p>
          </div>
          <button
            onClick={() => onChange(null)}
            className="text-xs text-blue-500 hover:text-blue-700 underline"
          >
            Bỏ chọn
          </button>
        </div>
      )}
    </div>
  );
}
