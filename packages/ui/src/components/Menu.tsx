'use client';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ElementType,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '../lib/cn';

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  /** A link item goes somewhere; an action item does something on this page. */
  href?: string;
  onSelect?: () => void;
}

/**
 * A small menu behind one button: the button says it has a menu and whether it
 * is open, the items are `menuitem`s, the arrow keys, Home and End move between
 * them, Escape closes it and returns focus to the button, and a click or focus
 * anywhere else closes it. Choosing an item closes the menu first, so anything
 * the item opens (a dialog) returns focus to the menu's button afterwards.
 */
export function Menu({
  label,
  icon,
  items,
  className,
  align = 'end',
  linkAs: LinkElement = 'a',
}: {
  /** The button's accessible name, and the menu's. */
  label: string;
  icon: ReactNode;
  items: readonly MenuItem[];
  className?: string;
  /** Which edge of the button the menu lines up with. */
  align?: 'start' | 'end';
  /** The element for link items, for example a router's Link. */
  linkAs?: ElementType;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState<false | 'first' | 'last'>(false);
  const options = () => [
    ...(root.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []),
  ];
  // Opening moves focus into the menu: to the first item, or the last after Arrow Up.
  useEffect(() => {
    if (!open) return;
    const all = options();
    (open === 'last' ? all.at(-1) : all[0])?.focus();
  }, [open]);
  // A press anywhere outside closes it and leaves focus where the person put it.
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  function close(returnFocus: boolean) {
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  }
  function onMenuKey(event: KeyboardEvent<HTMLDivElement>) {
    const all = options();
    const at = all.indexOf(document.activeElement as HTMLElement);
    const move = (index: number) => {
      event.preventDefault();
      all[(index + all.length) % all.length]?.focus();
    };
    if (event.key === 'ArrowDown') move(at + 1);
    else if (event.key === 'ArrowUp') move(at - 1);
    else if (event.key === 'Home') move(0);
    else if (event.key === 'End') move(all.length - 1);
    else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close(true);
    } else if (event.key === 'Tab') setOpen(false);
    else if (event.key.length === 1 && /\S/.test(event.key)) {
      // A letter jumps to the next item that starts with it.
      const letter = event.key.toLocaleLowerCase();
      const next = [...all.slice(at + 1), ...all.slice(0, at + 1)].find((item) =>
        item.textContent?.trim().toLocaleLowerCase().startsWith(letter),
      );
      next?.focus();
    }
  }
  return (
    <div
      ref={root}
      className={cn('menu', className)}
      data-open={Boolean(open)}
      onBlur={(event) => {
        // Focus that leaves the button and the menu altogether closes it.
        if (
          open &&
          event.relatedTarget instanceof Node &&
          !root.current?.contains(event.relatedTarget)
        )
          setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        id={`${id}-button`}
        className="icon-button menu-button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={Boolean(open)}
        aria-controls={open ? `${id}-menu` : undefined}
        onClick={() => setOpen((current) => (current ? false : 'first'))}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(event.key === 'ArrowUp' ? 'last' : 'first');
          }
        }}
      >
        {icon}
      </button>
      {open ? (
        <div
          id={`${id}-menu`}
          className="menu-list"
          role="menu"
          aria-labelledby={`${id}-button`}
          data-align={align}
          onKeyDown={onMenuKey}
        >
          {items.map((item) =>
            item.href ? (
              <LinkElement
                key={item.label}
                className="menu-item"
                role="menuitem"
                tabIndex={-1}
                href={item.href}
                onClick={() => {
                  setOpen(false);
                  item.onSelect?.();
                }}
              >
                {item.icon}
                {item.label}
              </LinkElement>
            ) : (
              <button
                key={item.label}
                type="button"
                className="menu-item"
                role="menuitem"
                tabIndex={-1}
                onClick={() => {
                  close(true);
                  item.onSelect?.();
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
