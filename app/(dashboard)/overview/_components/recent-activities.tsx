import Link from "next/link";
import React from "react";

export default function RecentActivities() {
  return (
    <div className="p-4 border border-neutral-200 rounded-lg space-y-4">
      <div className="flex justify-between">
        <h2 className="font-medium">Recent activities</h2>
        <Link href="/" className="text-sm text-neutral-600">
          See all
        </Link>
      </div>
      <ul className="space-y-3">
        <li>
          <p className="text-sm flex gap-x-2 justify-between items-center text-neutral-700">
            <span>Invoice n°2376</span>
            <span>11,232 $</span>
          </p>
          <p className="text-xs text-neutral-600">25 April at 09:30 am</p>
        </li>
        <li>
          <p className="text-sm flex gap-x-2 justify-between items-center text-neutral-700">
            <span>Invoice n°2376</span>
            <span>11,232 $</span>
          </p>
          <p className="text-xs text-neutral-600">25 April at 09:30 am</p>
        </li>
        <li>
          <p className="text-sm flex gap-x-2 justify-between items-center text-neutral-700">
            <span>Invoice n°2376</span>
            <span>11,232 $</span>
          </p>
          <p className="text-xs text-neutral-600">25 April at 09:30 am</p>
        </li>
        <li>
          <p className="text-sm flex gap-x-2 justify-between items-center text-neutral-700">
            <span>Invoice n°2376</span>
            <span>11,232 $</span>
          </p>
          <p className="text-xs text-neutral-600">25 April at 09:30 am</p>
        </li>
        <li>
          <p className="text-sm flex gap-x-2 justify-between items-center text-neutral-700">
            <span>Invoice n°2376</span>
            <span>11,232 $</span>
          </p>
          <p className="text-xs text-neutral-600">25 April at 09:30 am</p>
        </li>
      </ul>
    </div>
  );
}
