"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, toast, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export const successToast = (message: string, description?: string) => {
  toast(message, {
    description,
    className: "bg-green-100 text-green-900",
  });
};

export const errorToast = (message: string, description?: string) => {
  toast(message, {
    description,
    className: "bg-red-100 text-red-900",
  });
};

export { Toaster }
