"use client";

import { useState } from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { PA_CATEGORIES } from "@/types";

export interface FilterState {
    searchQuery: string;
    selectedYear: string;
    selectedCategories: string[];
    showOnlyFilled: boolean;
    showOnlyEmpty: boolean;
}

interface PASearchFilterProps {
    years: string[];
    selectedYear: string;
    onYearChange: (year: string) => void;
    onFilterChange?: (filters: FilterState) => void;
    showCategoryFilter?: boolean;
    showStatusFilter?: boolean;
}

export default function PASearchFilter({
    years,
    selectedYear,
    onYearChange,
    onFilterChange,
    showCategoryFilter = true,
    showStatusFilter = true,
}: PASearchFilterProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [showOnlyFilled, setShowOnlyFilled] = useState(false);
    const [showOnlyEmpty, setShowOnlyEmpty] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const hasActiveFilters = searchQuery || selectedCategories.length > 0 || showOnlyFilled || showOnlyEmpty;

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        notifyFilterChange({ searchQuery: query });
    };

    const toggleCategory = (categoryId: string) => {
        const newCategories = selectedCategories.includes(categoryId)
            ? selectedCategories.filter(c => c !== categoryId)
            : [...selectedCategories, categoryId];
        setSelectedCategories(newCategories);
        notifyFilterChange({ selectedCategories: newCategories });
    };

    const toggleStatusFilter = (type: "filled" | "empty") => {
        if (type === "filled") {
            const newValue = !showOnlyFilled;
            setShowOnlyFilled(newValue);
            if (newValue) setShowOnlyEmpty(false);
            notifyFilterChange({ showOnlyFilled: newValue, showOnlyEmpty: false });
        } else {
            const newValue = !showOnlyEmpty;
            setShowOnlyEmpty(newValue);
            if (newValue) setShowOnlyFilled(false);
            notifyFilterChange({ showOnlyEmpty: newValue, showOnlyFilled: false });
        }
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedCategories([]);
        setShowOnlyFilled(false);
        setShowOnlyEmpty(false);
        notifyFilterChange({
            searchQuery: "",
            selectedCategories: [],
            showOnlyFilled: false,
            showOnlyEmpty: false,
        });
    };

    const notifyFilterChange = (partial: Partial<FilterState>) => {
        if (onFilterChange) {
            onFilterChange({
                searchQuery,
                selectedYear,
                selectedCategories,
                showOnlyFilled,
                showOnlyEmpty,
                ...partial,
            });
        }
    };

    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
            {/* Main Search Row */}
            <div className="flex flex-wrap gap-3 items-center">
                {/* Search Input */}
                <div className="flex-1 min-w-[200px] relative">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="ค้นหา PA... (ชื่อ หรือ รหัส)"
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200
                                 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 
                                 transition-all text-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => handleSearchChange("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Year Selector */}
                <div className="relative">
                    <select
                        value={selectedYear}
                        onChange={(e) => onYearChange(e.target.value)}
                        aria-label="เลือกปี"
                        className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-gray-200
                                 focus:ring-2 focus:ring-blue-200 focus:border-blue-400
                                 bg-white text-sm font-medium cursor-pointer"
                        style={{ color: "var(--royal-blue)" }}
                    >
                        {years.map((year) => (
                            <option key={year} value={year}>
                                ปี {year}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                    />
                </div>

                {/* Filter Toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                              transition-colors ${showFilters || hasActiveFilters
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                    <Filter size={16} />
                    ตัวกรอง
                    {hasActiveFilters && (
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                </button>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm 
                                 text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <X size={16} />
                        ล้างตัวกรอง
                    </button>
                )}
            </div>

            {/* Expanded Filters */}
            {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                    {/* Category Filter */}
                    {showCategoryFilter && (
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-2 block">
                                หมวดหมู่ PA
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {PA_CATEGORIES.map((cat) => {
                                    const isSelected = selectedCategories.includes(cat.id);
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => toggleCategory(cat.id)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium
                                                      transition-all ${isSelected
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                }`}
                                        >
                                            {cat.labelTh}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Status Filter */}
                    {showStatusFilter && (
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-2 block">
                                สถานะ
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleStatusFilter("filled")}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium
                                              transition-all ${showOnlyFilled
                                            ? "bg-green-600 text-white"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    ✓ กรอกแล้ว
                                </button>
                                <button
                                    onClick={() => toggleStatusFilter("empty")}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium
                                              transition-all ${showOnlyEmpty
                                            ? "bg-orange-600 text-white"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    ○ ยังไม่กรอก
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
