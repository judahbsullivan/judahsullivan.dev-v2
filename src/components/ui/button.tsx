import { tw } from "@/lib/tw";
import { forwardRef } from "react";

type ButtonType = "button" | "submit" | "reset";
type Size = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size;
}

const sizeClasses = {
  xs: "w-12 sm:w-16",
  sm: "w-16 sm:w-26",
  md: "w-24 sm:w-48",
  lg: "w-32 sm:w-[15.5rem]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, type = "button", size = "lg", ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={tw(
          "aspect-square px-2 rounded-full flex items-center justify-center bg-gray-900/50 text-white font-medium hover:bg-gray-900/90 transition",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

