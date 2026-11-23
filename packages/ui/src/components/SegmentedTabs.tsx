'use client';
import { useId, useRef, type ReactNode } from 'react';
import { cn } from '../lib/cn';

type TabItem<Value extends string> = { value: Value; label: string; content: ReactNode };

/** Controlled horizontal tabs. Hidden panels stay mounted to preserve local state. */
export function SegmentedTabs<Value extends string>({
  label,
  items,
  value,
  onValueChange,
  className,
  variant = 'segmented',
  heading,
}: {
  label: string;
  items: readonly TabItem<Value>[];
  value: Value;
  onValueChange: (value: Value) => void;
  className?: string;
  /** `text` draws two quiet text tabs instead of the filled segmented control. */
  variant?: 'segmented' | 'text';
  /** Shown on the tab row, before the tabs: the section's own heading. */
  heading?: ReactNode;
}) {
  const id = useId();
  const list = useRef<HTMLDivElement>(null);
  const selected = Math.max(
    0,
    items.findIndex((item) => item.value === value),
  );
  function activate(index: number) {
    onValueChange(items[index].value);
    list.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[index]?.focus();
  }
  return (
    <div className={cn('segmented-tabs', className)} data-variant={variant}>
      <div className="segmented-tabs-bar">
        {heading}
        <div
          className="segmented-tabs-list"
          role="tablist"
          aria-label={label}
          aria-orientation="horizontal"
          ref={list}
        >
          {items.map((item, index) => (
            <button
              key={item.value}
              className="segmented-tab"
              type="button"
              role="tab"
              id={`${id}-tab-${index}`}
              aria-controls={`${id}-panel-${index}`}
              aria-selected={index === selected}
              tabIndex={index === selected ? 0 : -1}
              onClick={() => onValueChange(item.value)}
              onKeyDown={(event) => {
                const next =
                  event.key === 'ArrowRight'
                    ? (index + 1) % items.length
                    : event.key === 'ArrowLeft'
                      ? (index - 1 + items.length) % items.length
                      : event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                          ? items.length - 1
                          : null;
                if (next !== null) {
                  event.preventDefault();
                  activate(next);
                }
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      {items.map((item, index) => (
        <section
          key={item.value}
          className="segmented-tabs-panel"
          role="tabpanel"
          id={`${id}-panel-${index}`}
          aria-labelledby={`${id}-tab-${index}`}
          hidden={index !== selected}
          tabIndex={0}
        >
          {item.content}
        </section>
      ))}
    </div>
  );
}
