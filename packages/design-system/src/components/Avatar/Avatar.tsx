'use client';
import * as React from 'react';

/** Mirrors the Figma `Avatar` component set (Size × Type) + Status/Ring/Notification toggles — bound to avatar/* tokens.
 *  Type (Photo / Initials / Icon) is resolved from the content props: `src` → `name` initials → `icon`. */
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'busy' | 'away' | 'offline';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Photo URL (Photo type). Falls back to initials, then icon, then a generic person glyph. */
  src?: string;
  alt?: string;
  /** Used to derive initials (Initials type) and as the image alt when `alt` is unset. */
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  /** Icon fallback (Icon type) when there's no `src`/`name`. */
  icon?: React.ReactNode;
  /** Aurora "posted a status / active story" ring. */
  ring?: boolean;
  /** Unseen-activity notification dot (top-right). */
  notification?: boolean;
}

// sizes reconciled to the size/avatar-* tokens: sm 24 · md 32 · lg 40 · xl 56
const BOX: Record<AvatarSize, string> = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
  xl: 'h-14 w-14 text-xl',
};
const DOT: Record<AvatarSize, string> = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-[18px] w-[18px]',
};
const NOTIF: Record<AvatarSize, string> = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-3.5 w-3.5',
};
const STATUS_BG: Record<AvatarStatus, string> = {
  online: 'bg-[var(--avatar-status-online)]',
  busy: 'bg-[var(--avatar-status-busy)]',
  away: 'bg-[var(--avatar-status-away)]',
  offline: 'bg-[var(--avatar-status-offline)]',
};

function initials(name?: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const PersonIcon = (
  <svg viewBox="0 0 24 24" width="60%" height="60%" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
  </svg>
);

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, alt, name, size = 'md', status, icon, ring, notification, className = '', style, ...rest },
  ref,
) {
  const [broken, setBroken] = React.useState(false);
  const showImg = src && !broken;
  const ini = initials(name);

  return (
    <span
      ref={ref}
      className={[
        'relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
        'bg-[var(--avatar-bg)] text-[var(--avatar-label)] overflow-visible',
        // Aurora "posted" ring
        ring ? 'ring-2 ring-offset-2 ring-offset-[var(--avatar-ring)] [--tw-ring-color:var(--grad-via)]' : '',
        BOX[size],
        className,
      ].join(' ')}
      style={style}
      {...rest}
    >
      <span className="absolute inset-0 grid place-items-center overflow-hidden rounded-full">
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt ?? name ?? ''} className="h-full w-full object-cover" onError={() => setBroken(true)} />
        ) : ini ? (
          <span aria-hidden>{ini}</span>
        ) : (
          <span className="text-[var(--avatar-icon)]" aria-hidden>{icon ?? PersonIcon}</span>
        )}
      </span>
      {status && (
        <span
          className={['absolute bottom-0 right-0 rounded-full ring-2 ring-[var(--avatar-status-ring)]', DOT[size], STATUS_BG[status]].join(' ')}
          aria-label={status}
          role="img"
        />
      )}
      {notification && (
        <span
          className={['absolute top-0 right-0 rounded-full bg-[var(--accent-signal,var(--signal))] ring-2 ring-[var(--avatar-status-ring)]', NOTIF[size]].join(' ')}
          aria-label="unread activity"
          role="img"
        />
      )}
    </span>
  );
});

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max avatars to show before collapsing into a +N chip. */
  max?: number;
  size?: AvatarSize;
}

/** Overlapping stack of `Avatar`s with a +N overflow chip. */
export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  { max = 4, size = 'md', className = '', children, ...rest },
  ref,
) {
  const items = React.Children.toArray(children);
  const shown = items.slice(0, max);
  const overflow = items.length - shown.length;

  return (
    <div ref={ref} className={['flex items-center', className].join(' ')} {...rest}>
      {shown.map((child, i) => (
        <span key={i} className="-ml-2 rounded-full ring-2 ring-[var(--avatar-ring)] first:ml-0">
          {React.isValidElement<AvatarProps>(child) ? React.cloneElement(child, { size: child.props.size ?? size }) : child}
        </span>
      ))}
      {overflow > 0 && (
        <span
          className={['-ml-2 inline-flex items-center justify-center rounded-full font-semibold', 'bg-[var(--avatar-bg)] text-[var(--avatar-label)] ring-2 ring-[var(--avatar-ring)]', BOX[size]].join(' ')}
          aria-label={`${overflow} more`}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
});
