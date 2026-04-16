"use client";

import { usePickupStore } from "@/store/pickupStore";

interface OpenPickupButtonProps {
  className?: string;
  children: React.ReactNode;
}

export default function OpenPickupButton({ className, children }: OpenPickupButtonProps) {
  const openPickup = usePickupStore((state) => state.openPickup);

  return (
    <button
      type="button"
      onClick={openPickup}
      className={className}
    >
      {children}
    </button>
  );
}
