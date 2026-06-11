'use client';

import { useState } from 'react';
import { apiFetch, getClientToken } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import CustomerForm from '@/components/customers/CustomerForm';
import { Search, Trash2, ChevronLeft, ChevronRight, Phone, Mail } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface CustomerTableProps {
  initialCustomers: Customer[];
  initialPagination: Pagination;
}

export default function CustomerTable({
  initialCustomers,
  initialPagination,
}: CustomerTableProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch khách hàng với params
  const fetchCustomers = async (page = 1, searchTerm = search) => {
    setLoading(true);
    try {
      const token = await getClientToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const result = await apiFetch<{ data: Customer[]; pagination: Pagination }>(
        '/customers',
        {
          cache: 'no-store',
          headers,
          params: {
            page,
            limit: 10,
            search: searchTerm || undefined,
          },
        }
      );
      setCustomers(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Xóa khách hàng
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xác nhận xóa khách hàng "${name}"?\nThao tác này không thể hoàn tác.`)) return;
    try {
      const token = await getClientToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      await apiFetch(`/customers/${id}`, { method: 'DELETE', headers });
      fetchCustomers(pagination.page);
    } catch (err: any) {
      alert(err.message || 'Không thể xóa khách hàng');
    }
  };

  const handleSearch = () => {
    fetchCustomers(1, search);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar: Search + Add */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="customer-search"
              placeholder="Tìm theo tên hoặc số điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={handleSearch} id="customer-search-btn">
            Tìm
          </Button>
        </div>

        <CustomerForm onSuccess={() => fetchCustomers(1)} />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-sm px-3 py-1">
          Tổng: {pagination.total} khách hàng
        </Badge>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white overflow-x-auto">
        <Table className="min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Tên khách hàng</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center w-[100px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-400">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-400">
                  {search ? `Không tìm thấy khách hàng với từ khóa "${search}"` : 'Chưa có khách hàng nào'}
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer, index) => (
                <TableRow key={customer.id} id={`customer-row-${customer.id}`}>
                  <TableCell className="text-gray-500">
                    {(pagination.page - 1) * pagination.limit + index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>
                    {customer.phone ? (
                      <span className="flex items-center gap-1.5 text-sm">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {customer.phone}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm italic">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {customer.email ? (
                      <span className="flex items-center gap-1.5 text-sm">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {customer.email}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm italic">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <CustomerForm
                        customer={customer}
                        onSuccess={() => fetchCustomers(pagination.page)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(customer.id, customer.name)}
                        className="text-red-500 hover:text-red-700"
                        id={`delete-customer-${customer.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Hiển thị {customers.length} / {pagination.total} khách hàng
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchCustomers(pagination.page - 1)}
              id="customer-prev-page"
            >
              <ChevronLeft className="w-4 h-4" />
              Trước
            </Button>
            <span className="flex items-center px-3 text-sm text-gray-600">
              Trang {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchCustomers(pagination.page + 1)}
              id="customer-next-page"
            >
              Sau
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
