"use client";

import { useState, useMemo } from "react";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ListingCard } from "@/components/buyer/ListingCard";
import {
  DEAL_TYPES, INDUSTRIES, INDIAN_STATES, REVENUE_RANGES,
  EBITDA_RANGES, EMPLOYEE_RANGES, YEARS_IN_BUSINESS,
} from "@/lib/constants";
import type { Listing } from "@/types/database";

type Filters = {
  dealType: string;
  industries: string[];
  location: string;
  revenueRange: string;
  ebitdaRange: string;
  employeeRange: string;
  yearsInBusiness: string;
  closeReady: boolean;
  fullyVerified: boolean;
  search: string;
};

const defaultFilters: Filters = {
  dealType: "all",
  industries: [],
  location: "",
  revenueRange: "",
  ebitdaRange: "",
  employeeRange: "",
  yearsInBusiness: "",
  closeReady: false,
  fullyVerified: false,
  search: "",
};

type SortOption = "newest" | "price_high" | "price_low" | "revenue_high" | "most_viewed";

export function MarketplaceClient({ listings }: { listings: Listing[] }) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sort, setSort] = useState<SortOption>("newest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = [...listings];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(l =>
        (l.headline?.toLowerCase().includes(q)) ||
        (l.city?.toLowerCase().includes(q)) ||
        (l.sub_category?.toLowerCase().includes(q))
      );
    }
    if (filters.dealType !== "all") {
      result = result.filter(l => l.deal_type?.toLowerCase().replace(/[\s/]+/g, "_") === filters.dealType);
    }
    if (filters.industries.length > 0) {
      result = result.filter(l => l.industry && filters.industries.includes(l.industry));
    }
    if (filters.location) {
      result = result.filter(l => l.state === filters.location || l.city === filters.location);
    }
    if (filters.revenueRange) {
      const range = REVENUE_RANGES.find(r => r.value === filters.revenueRange);
      if (range) {
        result = result.filter(l => {
          const rev = (l.revenue_latest ?? 0) / 100;
          return rev >= range.min && rev <= range.max;
        });
      }
    }
    if (filters.ebitdaRange) {
      const range = EBITDA_RANGES.find(r => r.value === filters.ebitdaRange);
      if (range) {
        result = result.filter(l => {
          const margin = l.ebitda_margin ?? 0;
          return margin >= range.min && margin < range.max;
        });
      }
    }
    if (filters.employeeRange) {
      result = result.filter(l => l.employee_count_range === filters.employeeRange);
    }
    if (filters.yearsInBusiness) {
      const currentYear = new Date().getFullYear();
      result = result.filter(l => {
        if (!l.year_founded) return false;
        const age = currentYear - l.year_founded;
        switch (filters.yearsInBusiness) {
          case "lt_2": return age < 2;
          case "2_5": return age >= 2 && age < 5;
          case "5_10": return age >= 5 && age < 10;
          case "10_20": return age >= 10 && age < 20;
          case "20_plus": return age >= 20;
          default: return true;
        }
      });
    }
    if (filters.closeReady) result = result.filter(l => l.close_ready);
    if (filters.fullyVerified) result = result.filter(l => l.gst_verified && l.bank_verified && l.ca_reviewed);

    switch (sort) {
      case "price_high": result.sort((a, b) => (b.asking_price ?? 0) - (a.asking_price ?? 0)); break;
      case "price_low": result.sort((a, b) => (a.asking_price ?? 0) - (b.asking_price ?? 0)); break;
      case "revenue_high": result.sort((a, b) => (b.revenue_latest ?? 0) - (a.revenue_latest ?? 0)); break;
      case "most_viewed": result.sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0)); break;
      default: result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [listings, filters, sort]);

  const activeFilterChips = useMemo(() => {
    const chips: { label: string; clear: () => void }[] = [];
    if (filters.dealType !== "all") {
      const dt = DEAL_TYPES.find(d => d.value === filters.dealType);
      chips.push({ label: dt?.label ?? filters.dealType, clear: () => setFilters(f => ({ ...f, dealType: "all" })) });
    }
    filters.industries.forEach(ind => {
      const i = INDUSTRIES.find(x => x.value === ind);
      chips.push({ label: i?.label ?? ind, clear: () => setFilters(f => ({ ...f, industries: f.industries.filter(x => x !== ind) })) });
    });
    if (filters.location) chips.push({ label: filters.location, clear: () => setFilters(f => ({ ...f, location: "" })) });
    if (filters.revenueRange) {
      const r = REVENUE_RANGES.find(x => x.value === filters.revenueRange);
      chips.push({ label: r?.label ?? "", clear: () => setFilters(f => ({ ...f, revenueRange: "" })) });
    }
    if (filters.closeReady) chips.push({ label: "Close-Ready", clear: () => setFilters(f => ({ ...f, closeReady: false })) });
    if (filters.fullyVerified) chips.push({ label: "Fully Verified", clear: () => setFilters(f => ({ ...f, fullyVerified: false })) });
    return chips;
  }, [filters]);

  const clearAllFilters = () => setFilters(defaultFilters);

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Industry */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-2">Industry</h4>
        <div className="space-y-1.5">
          {INDUSTRIES.map(ind => (
            <label key={ind.value} className="flex items-center gap-2 text-sm cursor-pointer hover:text-emerald-700">
              <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                checked={filters.industries.includes(ind.value)}
                onChange={e => {
                  setFilters(f => ({
                    ...f,
                    industries: e.target.checked
                      ? [...f.industries, ind.value]
                      : f.industries.filter(x => x !== ind.value)
                  }));
                }}
              />
              {ind.label}
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-2">Location</h4>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="radio" name="location" className="text-emerald-600"
              checked={!filters.location} onChange={() => setFilters(f => ({ ...f, location: "" }))} />
            Pan India
          </label>
          {INDIAN_STATES.map(s => (
            <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="location" className="text-emerald-600"
                checked={filters.location === s} onChange={() => setFilters(f => ({ ...f, location: s }))} />
              {s}
            </label>
          ))}
        </div>
      </div>

      {/* Revenue */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-2">Revenue Range</h4>
        <div className="space-y-1">
          {REVENUE_RANGES.map(r => (
            <label key={r.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="revenue" className="text-emerald-600"
                checked={filters.revenueRange === r.value}
                onChange={() => setFilters(f => ({ ...f, revenueRange: r.value }))} />
              {r.label}
            </label>
          ))}
        </div>
      </div>

      {/* EBITDA */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-2">EBITDA Margin</h4>
        <div className="space-y-1">
          {EBITDA_RANGES.map(r => (
            <label key={r.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="ebitda" className="text-emerald-600"
                checked={filters.ebitdaRange === r.value}
                onChange={() => setFilters(f => ({ ...f, ebitdaRange: r.value }))} />
              {r.label}
            </label>
          ))}
        </div>
      </div>

      {/* Employee Count */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-2">Team Size</h4>
        <div className="space-y-1">
          {EMPLOYEE_RANGES.map(r => (
            <label key={r.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="employees" className="text-emerald-600"
                checked={filters.employeeRange === r.value}
                onChange={() => setFilters(f => ({ ...f, employeeRange: r.value }))} />
              {r.label}
            </label>
          ))}
        </div>
      </div>

      {/* Years */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-2">Years in Business</h4>
        <div className="space-y-1">
          {YEARS_IN_BUSINESS.map(r => (
            <label key={r.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="years" className="text-emerald-600"
                checked={filters.yearsInBusiness === r.value}
                onChange={() => setFilters(f => ({ ...f, yearsInBusiness: r.value }))} />
              {r.label}
            </label>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-2 border-t">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm">Close-Ready Only</span>
          <input type="checkbox" className="rounded text-emerald-600"
            checked={filters.closeReady} onChange={e => setFilters(f => ({ ...f, closeReady: e.target.checked }))} />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm">Fully Verified Only</span>
          <input type="checkbox" className="rounded text-emerald-600"
            checked={filters.fullyVerified} onChange={e => setFilters(f => ({ ...f, fullyVerified: e.target.checked }))} />
        </label>
      </div>

      <Button variant="outline" className="w-full" onClick={clearAllFilters}>
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-[calc(100dvh-3.5rem)]">
      {/* Header */}
      <div className="border-b bg-white sticky top-14 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">TheBuzSale Marketplace</h1>
              <p className="text-sm text-slate-500">{filtered.length} verified business{filtered.length !== 1 ? "es" : ""}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile filter button */}
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden">
                    <SlidersHorizontal className="size-4 mr-1" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <FilterPanel />
                  </div>
                </SheetContent>
              </Sheet>

              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortOption)}
                className="text-sm border rounded-lg px-3 py-2 bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="price_high">Price: High to Low</option>
                <option value="price_low">Price: Low to High</option>
                <option value="revenue_high">Revenue: High to Low</option>
                <option value="most_viewed">Most Viewed</option>
              </select>
            </div>
          </div>

          {/* Deal Type Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 -mb-4">
            {DEAL_TYPES.map(dt => (
              <button key={dt.value} onClick={() => setFilters(f => ({ ...f, dealType: dt.value }))}
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  filters.dealType === dt.value
                    ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}>
                {dt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Active Filter Chips */}
        {activeFilterChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilterChips.map((chip, i) => (
              <Badge key={i} variant="secondary" className="pl-2 pr-1 py-1 gap-1 bg-emerald-50 text-emerald-700">
                {chip.label}
                <button onClick={chip.clear} className="ml-1 hover:bg-emerald-200 rounded-full p-0.5">
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
            <button onClick={clearAllFilters} className="text-xs text-slate-500 hover:text-red-600 ml-2">
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-72 shrink-0">
            <div className="sticky top-40 overflow-y-auto max-h-[calc(100vh-12rem)] pr-2">
              <FilterPanel />
            </div>
          </aside>

          {/* Listing Grid */}
          <main className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <Search className="size-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-1">No listings match your filters</h3>
                <p className="text-sm text-slate-500 mb-4">Try adjusting your criteria or clear filters</p>
                <Button variant="outline" onClick={clearAllFilters}>Clear All Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filtered.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
