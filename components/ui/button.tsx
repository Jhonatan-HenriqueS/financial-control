import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border-0 bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-300 ease-out outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 disabled:hover:scale-100 aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        sun:
          "border-0 rounded-2xl bg-[linear-gradient(135deg,#ff6500,#ffb51b)] font-bold text-white shadow-[0_8px_22px_rgba(255,132,0,0.18)] hover:scale-[1.02] hover:brightness-105 hover:shadow-[0_10px_26px_rgba(255,132,0,0.24)] focus-visible:ring-0 focus-visible:shadow-[0_10px_26px_rgba(255,132,0,0.24)]",
        sunAuth:
          "border-0 rounded-2xl bg-[linear-gradient(135deg,#ff5f00_0%,#ff8a00_45%,#ffbd17_100%)] text-white shadow-[0_10px_24px_rgba(255,132,0,0.18)] hover:scale-[1.02] hover:brightness-105 hover:shadow-[0_12px_30px_rgba(255,132,0,0.24)] focus-visible:ring-0 focus-visible:shadow-[0_12px_30px_rgba(255,132,0,0.24)] sm:rounded-[19px]",
        softIcon:
          "border-0 rounded-2xl bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(255,235,208,0.72))] text-[#d95f00] shadow-[0_7px_18px_rgba(255,132,0,0.12)] hover:scale-[1.03] hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,226,188,0.86))] hover:shadow-[0_9px_24px_rgba(255,132,0,0.18)] focus-visible:ring-0 focus-visible:shadow-[0_9px_24px_rgba(255,132,0,0.18)]",
        glassIcon:
          "border-0 rounded-xl bg-white/58 text-slate-950 shadow-[0_5px_14px_rgba(255,132,0,0.08)] hover:scale-[1.03] hover:bg-white/78 hover:shadow-[0_8px_20px_rgba(255,132,0,0.16)] focus-visible:ring-0 focus-visible:shadow-[0_8px_20px_rgba(255,132,0,0.16)]",
        whiteAction:
          "border-0 rounded-xl bg-white text-slate-950 shadow-[0_6px_18px_rgba(15,23,42,0.05)] hover:scale-[1.02] hover:bg-orange-50 hover:shadow-[0_8px_22px_rgba(255,132,0,0.14)] focus-visible:ring-0 focus-visible:shadow-[0_8px_22px_rgba(255,132,0,0.14)]",
        dangerAction:
          "border-0 rounded-xl bg-red-100 text-red-800 shadow-[0_6px_18px_rgba(185,28,28,0.12)] hover:scale-[1.02] hover:bg-red-200 hover:text-red-900 hover:shadow-[0_8px_22px_rgba(185,28,28,0.2)] focus-visible:ring-0 focus-visible:shadow-[0_8px_22px_rgba(185,28,28,0.2)]",
        translucentAction:
          "border-0 rounded-2xl bg-white/45 text-slate-950 shadow-[0_7px_20px_rgba(255,132,0,0.09)] hover:scale-[1.02] hover:bg-white/65 hover:shadow-[0_9px_24px_rgba(255,132,0,0.16)] focus-visible:ring-0 focus-visible:shadow-[0_9px_24px_rgba(255,132,0,0.16)]",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
        appIcon: "h-12 w-12",
        panelIcon: "h-9 w-9",
        form: "h-14 w-full px-5 text-base",
        cta: "h-12 gap-2 px-5 text-sm",
        actionRow: "h-10 w-full justify-start gap-2 px-3 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
