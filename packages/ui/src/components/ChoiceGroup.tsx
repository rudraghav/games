import { cn } from '../lib/cn';

export function ChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
  variant = 'pills',
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  variant?: 'pills' | 'segmented';
}) {
  return (
    <div
      className={cn('choice-group', className)}
      role="group"
      aria-label={label}
      data-variant={variant}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
