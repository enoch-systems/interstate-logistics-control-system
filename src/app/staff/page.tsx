'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

// ========== TYPES ==========
interface Shipment {
  id: string;
  driverPhone: string;
  customerPhone: string;
  location: 'A' | 'B' | 'OUTSIDE';
  arrivalTime: string;
  collected: boolean;
}

interface QuickEntryData {
  driverPhone: string;
  customerPhone: string;
  location: 'A' | 'B' | 'OUTSIDE';
}

// ========== MOCK DATA ==========
const MOCK_SHIPMENTS: Shipment[] = [
  {
    id: '1',
    driverPhone: '08031234567',
    customerPhone: '08131234567',
    location: 'A',
    arrivalTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    collected: false,
  },
  {
    id: '2',
    driverPhone: '07045678901',
    customerPhone: '09045678901',
    location: 'B',
    arrivalTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    collected: false,
  },
  {
    id: '3',
    driverPhone: '08129876543',
    customerPhone: '07029876543',
    location: 'OUTSIDE',
    arrivalTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    collected: true,
  },
  {
    id: '4',
    driverPhone: '09051234567',
    customerPhone: '08051234567',
    location: 'A',
    arrivalTime: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    collected: false,
  },
  {
    id: '5',
    driverPhone: '07087654321',
    customerPhone: '09087654321',
    location: 'B',
    arrivalTime: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    collected: false,
  },
];

// ========== UTILITY FUNCTIONS ==========
const maskPhone = (phone: string): string => {
  if (phone.length < 4) return phone;
  return `${phone.slice(0, 4)}****${phone.slice(-4)}`;
};

const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// ========== COMPONENTS ==========

// --- SearchBar Component ---
interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange, inputRef }) => {
  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  return (
    <div className="bg-white p-4 shadow-sm border-b border-gray-200">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value.replace(/[^0-9]/g, ''))}
        placeholder="Type driver number or last 4 digits..."
        className="w-full text-2xl md:text-3xl font-bold p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
        autoFocus
      />
    </div>
  );
};

// --- ResultItem Component ---
interface ResultItemProps {
  shipment: Shipment;
  isExpanded: boolean;
  onToggle: () => void;
  onMarkCollected: (id: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

const ResultItem: React.FC<ResultItemProps> = ({
  shipment,
  isExpanded,
  onToggle,
  onMarkCollected,
  searchInputRef,
}) => {
  const handleMarkCollected = () => {
    onMarkCollected(shipment.id);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const locationColors = {
    A: 'bg-blue-100 text-blue-800 border-blue-200',
    B: 'bg-purple-100 text-purple-800 border-purple-200',
    OUTSIDE: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 cursor-pointer transition-all ${
        shipment.collected ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-gray-300'
      } ${isExpanded ? 'p-4' : 'p-3'}`}
      onClick={onToggle}
    >
      {/* Collapsed View */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className={`text-xl md:text-2xl font-bold ${shipment.collected ? 'text-green-700' : 'text-gray-900'}`}>
            ***{shipment.driverPhone.slice(-4)}
          </span>
          <span className="text-sm md:text-base text-gray-600">
            {maskPhone(shipment.customerPhone)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${locationColors[shipment.location]}`}>
            {shipment.location}
          </span>
          <span className="text-xs text-gray-500">
            {formatTime(shipment.arrivalTime)}
          </span>
          {shipment.collected && <span className="text-green-600 font-bold text-sm">COLLECTED</span>}
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Driver Phone</p>
              <p className="text-lg font-semibold text-gray-900">{shipment.driverPhone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Customer Phone</p>
              <p className="text-lg font-semibold text-gray-900">{shipment.customerPhone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
              <p className={`text-lg font-semibold px-3 py-1 rounded-full inline-block ${locationColors[shipment.location]}`}>
                {shipment.location}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <a
              href={`tel:${shipment.customerPhone}`}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold text-center hover:bg-blue-700 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Call Customer
            </a>
            {!shipment.collected && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkCollected();
                }}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Mark as Collected
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- ResultsList Component ---
interface ResultsListProps {
  shipments: Shipment[];
  searchTerm: string;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  onMarkCollected: (id: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

const ResultsList: React.FC<ResultsListProps> = ({
  shipments,
  searchTerm,
  expandedId,
  onToggleExpand,
  onMarkCollected,
  searchInputRef,
}) => {
  const filteredShipments = useMemo(() => {
    if (!searchTerm) return shipments.filter(s => !s.collected);
    const searchLower = searchTerm.toLowerCase();
    return shipments.filter(
      (s) =>
        s.driverPhone.includes(searchLower) ||
        s.customerPhone.includes(searchLower) ||
        s.driverPhone.slice(-4).includes(searchLower)
    );
  }, [shipments, searchTerm]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {filteredShipments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">No shipments found</p>
          <p className="text-sm mt-1">Try searching with different digits</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredShipments.map((shipment) => (
            <ResultItem
              key={shipment.id}
              shipment={shipment}
              isExpanded={expandedId === shipment.id}
              onToggle={() => onToggleExpand(shipment.id)}
              onMarkCollected={onMarkCollected}
              searchInputRef={searchInputRef}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- QuickEntry Component ---
interface QuickEntryProps {
  entry: QuickEntryData;
  onEntryChange: (field: keyof QuickEntryData, value: string) => void;
  onSubmit: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

const QuickEntry: React.FC<QuickEntryProps> = ({
  entry,
  onEntryChange,
  onSubmit,
  searchInputRef,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (entry.driverPhone && entry.customerPhone) {
      onSubmit();
    }
  };

  return (
    <div className="bg-white p-4 border-t border-gray-200 shadow-lg">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Quick Entry</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          value={entry.driverPhone}
          onChange={(e) => onEntryChange('driverPhone', e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="Driver phone"
          className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-base"
          maxLength={11}
        />
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          value={entry.customerPhone}
          onChange={(e) => onEntryChange('customerPhone', e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="Customer phone"
          className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-base"
          maxLength={11}
        />
        <select
          value={entry.location}
          onChange={(e) => onEntryChange('location', e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-base bg-white"
        >
          <option value="A">Location A</option>
          <option value="B">Location B</option>
          <option value="OUTSIDE">Outside</option>
        </select>
        <button
          type="submit"
          disabled={!entry.driverPhone || !entry.customerPhone}
          className="bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          onClick={() => setTimeout(() => searchInputRef.current?.focus(), 50)}
        >
          Save Entry
        </button>
      </form>
    </div>
  );
};

// ========== MAIN PAGE COMPONENT ==========
export default function StaffDashboard() {
  const [shipments, setShipments] = useState<Shipment[]>(MOCK_SHIPMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [quickEntry, setQuickEntry] = useState<QuickEntryData>({
    driverPhone: '',
    customerPhone: '',
    location: 'A',
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setExpandedId(null);
  };

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleMarkCollected = (id: string) => {
    setShipments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, collected: true } : s))
    );
    setExpandedId(null);
  };

  const handleQuickEntryChange = (field: keyof QuickEntryData, value: string) => {
    setQuickEntry((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuickEntrySubmit = () => {
    const newShipment: Shipment = {
      id: Date.now().toString(),
      driverPhone: quickEntry.driverPhone,
      customerPhone: quickEntry.customerPhone,
      location: quickEntry.location,
      arrivalTime: new Date().toISOString(),
      collected: false,
    };
    setShipments((prev) => [newShipment, ...prev]);
    setQuickEntry({ driverPhone: '', customerPhone: '', location: 'A' });
    searchInputRef.current?.focus();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close expanded item
      if (e.key === 'Escape') {
        setExpandedId(null);
        searchInputRef.current?.focus();
      }
      // / to focus search
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 text-white p-4">
        <h1 className="text-lg md:text-xl font-bold">Staff Dashboard - Shipment Verification</h1>
      </header>

      {/* Search Section */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        inputRef={searchInputRef}
      />

      {/* Results Section */}
      <ResultsList
        shipments={shipments}
        searchTerm={searchTerm}
        expandedId={expandedId}
        onToggleExpand={handleToggleExpand}
        onMarkCollected={handleMarkCollected}
        searchInputRef={searchInputRef}
      />

      {/* Quick Entry Section */}
      <QuickEntry
        entry={quickEntry}
        onEntryChange={handleQuickEntryChange}
        onSubmit={handleQuickEntrySubmit}
        searchInputRef={searchInputRef}
      />
    </div>
  );
}
