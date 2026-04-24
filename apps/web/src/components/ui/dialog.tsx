'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;

export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = 'DialogOverlay';

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  showClose?: boolean;
  side?: 'center' | 'right';
}

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, showClose = true, side = 'center', ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 bg-surface shadow-xl',
        side === 'center' &&
          'left-[50%] top-[50%] max-h-[90vh] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] overflow-y-auto rounded-lg border border-border',
        side === 'right' &&
          'right-0 top-0 h-screen w-full max-w-md overflow-y-auto border-l border-border',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        side === 'center' &&
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        side === 'right' &&
          'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
        className,
      )}
      {...props}
    >
      {children}
      {showClose && (
        <DialogPrimitive.Close
          className={cn(
            'absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = 'DialogContent';

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col gap-1.5 border-b border-border px-6 py-4', className)}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 border-t border-border px-6 py-4 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  );
}

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
));
DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';

export function DialogBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 py-4', className)} {...props} />;
}
