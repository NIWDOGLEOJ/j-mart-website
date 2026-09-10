import React from 'react';

interface CategoryFilterProps {
  categories: { name: string; count: number }[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full overflow-x-auto py-2 scrollbar-none">
      <div className="flex items-center gap-2 min-w-max px-1">
        {categories.map(({ name, count }) => {
          const isActive = selectedCategory === name;
          return (
            <button
              key={name}
              onClick={() => onSelectCategory(name)}
              type="button"
              aria-pressed={isActive}
              aria-label={`${name} category, ${count} products`}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 shadow-xs'
              }`}
            >
              <span>{name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
