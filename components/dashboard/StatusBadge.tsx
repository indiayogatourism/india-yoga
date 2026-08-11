import React from "react"

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const upper = (status || "").toUpperCase()

  let style = "bg-gray-100 text-gray-700 border-gray-200"
  let label = upper

  switch (upper) {
    case "CONFIRMED":
    case "PAID":
    case "COMPLETED":
    case "APPROVED":
      style = "bg-emerald-50 text-emerald-700 border-emerald-200/60"
      label = upper === "CONFIRMED" ? "Confirmed" : upper === "PAID" ? "Paid" : upper === "APPROVED" ? "Approved" : "Completed"
      break
    case "PENDING":
    case "UNDER_REVIEW":
      style = "bg-amber-50 text-amber-700 border-amber-200/60"
      label = upper === "UNDER_REVIEW" ? "Under Review" : "Pending"
      break
    case "CANCELLED":
    case "REJECTED":
    case "FAILED":
    case "REFUNDED":
      style = "bg-rose-50 text-rose-700 border-rose-200/60"
      label = upper === "CANCELLED" ? "Cancelled" : upper === "REFUNDED" ? "Refunded" : upper === "REJECTED" ? "Rejected" : "Failed"
      break
    default:
      break
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75 animate-pulse" />
      {label}
    </span>
  )
}
