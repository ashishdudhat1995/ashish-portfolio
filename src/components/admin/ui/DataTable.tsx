import React, { useState } from 'react';
import { Search, ChevronUp, ChevronDown, Eye, EyeOff, Edit, Trash2 } from 'lucide-react';

export interface ColumnDef<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T extends { id: string; order?: number; enabled?: boolean; status?: string }> {
  title: string;
  items: T[];
  columns: ColumnDef<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onToggleEnabled?: (item: T) => void;
  onReorderUp?: (item: T) => void;
  onReorderDown?: (item: T) => void;
  onAddNew?: () => void;
  searchPlaceholder?: string;
}

export function DataTable<T extends { id: string; order?: number; enabled?: boolean; status?: string }>({
  title,
  items,
  columns,
  onEdit,
  onDelete,
  onToggleEnabled,
  onReorderUp,
  onReorderDown,
  onAddNew,
  searchPlaceholder = 'Search records...'
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEnabled, setFilterEnabled] = useState<'all' | 'enabled' | 'disabled'>('all');

  const filteredItems = items.filter(item => {
    const matchesSearch = JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEnabled = 
      filterEnabled === 'all' ||
      (filterEnabled === 'enabled' && item.enabled !== false) ||
      (filterEnabled === 'disabled' && item.enabled === false);
    return matchesSearch && matchesEnabled;
  });

  return (
    <div className="bg-bgCard border border-borderGlass rounded-2xl overflow-hidden shadow-xl font-mono text-xs">
      
      {/* Header Bar with Title, Search, Filters, Add New Button */}
      <div className="p-5 border-b border-borderGlass flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bgSurface/50">
        <div>
          <h3 className="text-base font-bold text-white leading-none mb-1">{title}</h3>
          <p className="text-gray-400 text-[11px]">Managing {filteredItems.length} of {items.length} total records</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 pr-3 py-1.5 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue text-xs w-48"
            />
          </div>

          {/* Enabled Filter Pill */}
          <select
            value={filterEnabled}
            onChange={(e) => setFilterEnabled(e.target.value as 'all' | 'enabled' | 'disabled')}
            className="px-3 py-1.5 rounded-xl bg-bgVoid border border-borderGlass text-gray-300 text-xs focus:outline-none focus:border-accentBlue cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="enabled">Enabled Only</option>
            <option value="disabled">Disabled Only</option>
          </select>

          {/* Add New Button */}
          {onAddNew && (
            <button
              type="button"
              onClick={onAddNew}
              className="px-4 py-1.5 rounded-xl bg-accentBlue text-white font-bold hover:bg-accentIndigo transition-colors cursor-pointer text-xs flex items-center gap-1.5"
            >
              <span>+ Add Record</span>
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          No records match your criteria.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-borderGlass bg-bgVoid/60 text-gray-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 w-16 text-center">Order</th>
                <th className="py-3 px-4 w-20">Status</th>
                {columns.map((col, idx) => (
                  <th key={idx} className={`py-3 px-4 ${col.className || ''}`}>{col.header}</th>
                ))}
                <th className="py-3 px-4 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderGlass/60">
              {filteredItems.map((item, idx) => (
                <tr key={item.id} className="hover:bg-bgCardHover/60 transition-colors">
                  
                  {/* Order Controls */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-gray-400 font-bold w-4 text-[11px]">{item.order ?? idx + 1}</span>
                      <div className="flex flex-col">
                        {onReorderUp && (
                          <button
                            type="button"
                            onClick={() => onReorderUp(item)}
                            className="text-gray-400 hover:text-white p-0.5 cursor-pointer"
                            title="Move Up"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                        )}
                        {onReorderDown && (
                          <button
                            type="button"
                            onClick={() => onReorderDown(item)}
                            className="text-gray-400 hover:text-white p-0.5 cursor-pointer"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Enable / Disable Status */}
                  <td className="py-3 px-4">
                    {onToggleEnabled ? (
                      <button
                        type="button"
                        onClick={() => onToggleEnabled(item)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer ${
                          item.enabled !== false 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {item.enabled !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{item.enabled !== false ? 'Enabled' : 'Disabled'}</span>
                      </button>
                    ) : (
                      <span className="text-gray-400 text-[10px]">—</span>
                    )}
                  </td>

                  {/* Dynamic Custom Columns */}
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className={`py-3 px-4 text-gray-200 ${col.className || ''}`}>
                      {col.accessor(item)}
                    </td>
                  ))}

                  {/* Actions Column */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="p-1.5 rounded-lg bg-bgVoid border border-borderGlass text-gray-300 hover:text-accentCyan hover:border-accentCyan transition-colors cursor-pointer"
                          title="Edit Record"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          className="p-1.5 rounded-lg bg-bgVoid border border-borderGlass text-gray-300 hover:text-rose-400 hover:border-rose-400 transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
