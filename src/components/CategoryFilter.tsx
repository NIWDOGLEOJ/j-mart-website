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
    <div className="w-full overflow-x-auto py-1 scrollbar-none">
      <div className="flex items-center gap-2 min-w-max px-0.5">
        {categories.map(({ name, count }) => {
          const isActive = selectedCategory === name;
          return (
            <button
              key={name}
              onClick={() => onSelectCategory(name)}
              type="button"
              aria-pressed={isActive}
              aria-label={`${name} category, ${count} products`}
              className={`h-[38px] px-3.5 rounded-lg text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-2 select-none ${
                isActive
                  ? 'bg-[var(--accent-soft)] text-[var(--accent-hi)] border-[1.5px] border-[var(--accent-line)]'
                  : 'bg-[var(--panel)] hover:bg-[var(--sub)] text-[var(--ink2)] hover:text-[var(--ink)] border border-[var(--border)]'
              }`}
            >
              <span>{name}</span>
              <span
                className={`font-mono text-[10px] tabular-nums font-bold px-1.5 py-0.5 rounded ${
                  isActive
                    ? 'bg-[var(--panel)] text-[var(--accent-hi)] border border-[var(--accent-line)]/40'
                    : 'bg-[var(--sub)] text-[var(--ink3)] border border-[var(--border)]'
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
