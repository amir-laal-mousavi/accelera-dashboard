"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface InputOTPProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string
  onChange: (value: string) => void
  maxLength?: number
  containerClassName?: string
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

function InputOTP({
  value,
  onChange,
  maxLength = 6,
  containerClassName,
  onKeyDown,
  disabled,
  ...props
}: InputOTPProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, maxLength)
    onChange(val)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyDown) {
      onKeyDown(e)
    }
  }

  return (
    <div className={cn("flex items-center gap-2", containerClassName)}>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        maxLength={maxLength}
        disabled={disabled}
        className={cn(
          "w-full text-center text-2xl tracking-widest font-mono",
          "border border-input rounded-md px-3 py-2",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "bg-background"
        )}
        {...props}
      />
    </div>
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  value = "",
  ...props
}: React.ComponentProps<"div"> & {
  index: number
  value?: string
}) {
  const char = value?.[index] || ""

  return (
    <div
      className={cn(
        "relative flex h-9 w-9 items-center justify-center",
        "border border-input rounded-md",
        "bg-background text-sm font-medium",
        "focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent",
        className
      )}
      {...props}
    >
      {char}
    </div>
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div className="flex items-center justify-center h-9" {...props}>
      <span className="text-muted-foreground">-</span>
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }