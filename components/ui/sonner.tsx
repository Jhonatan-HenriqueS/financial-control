"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-[#ff6500]" />,
        info: <InfoIcon className="size-4 text-[#ff6500]" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-600" />,
        error: <OctagonXIcon className="size-4 text-red-700" />,
        loading: <Loader2Icon className="size-4 animate-spin text-[#ff6500]" />,
      }}
      style={
        {
          "--normal-bg": "rgba(255, 255, 255, 0.94)",
          "--normal-text": "#0f172a",
          "--normal-border": "rgba(255, 132, 0, 0.18)",
          "--success-bg": "rgba(255, 247, 237, 0.96)",
          "--success-text": "#0f172a",
          "--success-border": "rgba(255, 132, 0, 0.22)",
          "--border-radius": "18px",
          "--toast-close-button-start": "unset",
          "--toast-close-button-end": "0",
          "--toast-close-button-transform": "translate(35%, -35%)",
          zIndex: 99999,
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "shadow-[0_18px_48px_rgba(255,132,0,0.16),0_18px_54px_rgba(45,35,24,0.08)] backdrop-blur-xl",
          title: "font-bold",
          description: "text-slate-500",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
