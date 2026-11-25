import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CD-${timestamp}-${random}`;
}

export function getOrderStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PREPARING: "Preparing",
    READY_FOR_PICKUP: "Ready for Pickup",
    ASSIGNED: "Rider Assigned",
    PICKED_UP: "Picked Up",
    IN_TRANSIT: "On the Way",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };
  return labels[status] || status;
}

export function getOrderStatusColor(status: string) {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PREPARING: "bg-orange-100 text-orange-800",
    READY_FOR_PICKUP: "bg-purple-100 text-purple-800",
    ASSIGNED: "bg-indigo-100 text-indigo-800",
    PICKED_UP: "bg-cyan-100 text-cyan-800",
    IN_TRANSIT: "bg-sky-100 text-sky-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}
