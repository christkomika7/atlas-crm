import React from "react";
import Notification from "./notification";

export default function Notifications() {
  return (
    <div className="border border-neutral-200 rounded-xl p-4 space-y-2">
      <Notification
        title="Invoice AG-5678"
        content="opened by the client with the amount"
        type="signal"
      />
      <Notification
        title="Invoice AG-5678"
        content="opened by the client with the amount"
        type="signal"
      />
      <Notification
        title="Invoice AG-5678"
        content="opened by the client with the amount"
        type="signal"
      />
      <Notification
        title="Invoice AG-5678"
        content="opened by the client with the amount"
        type="action"
      />
      <Notification
        title="Invoice AG-5678"
        content="opened by the client with the amount"
        type="signal"
      />
      <Notification
        title="Invoice AG-5678"
        content="opened by the client with the amount"
        type="signal"
      />
      <Notification
        title="Invoice AG-5678"
        content="opened by the client with the amount"
        type="signal"
      />
      <Notification
        title="Invoice AG-5678"
        content="opened by the client with the amount"
        type="action"
      />
      <Notification
        title="Invoice AG-5678"
        content="opened by the client with the amount"
        type="signal"
      />
      <Notification
        title="Invoice AG-5678"
        content="opened by the client with the amount"
        type="signal"
      />
      <Notification
        title="Invoice AG-5678"
        content="opened by the client with the amount"
        type="signal"
      />
      <Notification
        title="Invoice AG-5678"
        content="opened by the client with the amount"
        type="action"
        last={false}
      />
    </div>
  );
}
