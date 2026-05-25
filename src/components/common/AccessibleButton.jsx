import React from "react";

export default function AccessibleButton({
  children,
  onClick,
  onKeyDown,
  className = "",
  ariaLabel,
  type = "submit",
  disabled = false
}) {
  const handleKeyDown = (event) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if ((event.key === "Enter" || event.key === " ") && type === "button") {
      event.preventDefault();
      onClick?.(event);
    }
  };

  return (
    <button
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`focus-ring inline-flex min-h-11 items-center rounded-lg px-5 py-3 text-base font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}
