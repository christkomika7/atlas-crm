'use client';

import { confirmNotificationAction } from "@/action/notification";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import { DELIVERY_NOTE_PREFIX, INVOICE_PREFIX, PURCHASE_ORDER_PREFIX, QUOTE_PREFIX } from "@/config/constant";
import useQueryAction from "@/hook/useQueryAction";
import { getSession } from "@/lib/auth-client";
import { cn, generateAmaId } from "@/lib/utils";
import { RequestResponse } from "@/types/api.types";
import { NotificationType } from "@/types/notification.type";
import { FileCheck2Icon, InfoIcon } from "lucide-react";
import React from "react";

type NotificationProps = {
  notification: NotificationType;
  last?: boolean;
  onMarkAsRead?: (notificationId: string, url?: string) => void;
  onNotificationUpdate?: (notificationId: string, updatedNotification: NotificationType) => void;

};

export default function Notification({
  notification,
  last = true,
  onMarkAsRead,
  onNotificationUpdate
}: NotificationProps) {
  const session = getSession()

  const type = notification.type === 'ALERT' ? 'signal' : 'action';
  const content = notification.message;

  const isRead = notification.readBy.some(read => read.user.id === session.data?.user.id);

  const { mutate: mutateConfirm, isPending: isConfirm } = useQueryAction<
    { notificationId: string, action: "validate" | "cancel" },
    RequestResponse<NotificationType>
  >(confirmNotificationAction, () => { }, "notifications");

  function getLink() {

    switch (notification.for) {
      case "INVOICE":
        return notification.invoice?.id ? `/invoice/${notification.invoice.id}` : undefined;
      case "PURCHASE_ORDER":
        return notification.purchaseOrder?.id ? `/purchase-order/${notification.purchaseOrder.id}` : undefined;
      case "QUOTE":
        return notification.quote?.id ? `/quote/${notification.quote.id}` : undefined;
      case "DELIVERY_NOTE":
        return notification.deliveryNote?.id ? `/delivery-note/${notification.deliveryNote.id}` : undefined;
      case "RECEIPT":
        return '/transaction';
      case "DISBURSEMENT":
        return '/transaction';
      case "APPOINTMENT":
        return '/appointment';
      case "TASK":
        return notification.task?.project.id ? `/project/${notification.task?.project.id}` : undefined;
    }
  }

  function getTitle() {
    switch (notification.for) {
      case "INVOICE":
        return `Facture ${notification.invoice?.company?.documentModel?.invoicesPrefix || INVOICE_PREFIX}-${generateAmaId(notification.invoice?.invoiceNumber || 0, false)}`;
      case "PURCHASE_ORDER":
        return `Bon de commande ${notification.purchaseOrder?.company?.documentModel?.purchaseOrderPrefix || PURCHASE_ORDER_PREFIX}-${generateAmaId(notification.purchaseOrder?.purchaseOrderNumber || 0, false)}`;
      case "QUOTE":
        return `Devis ${notification.quote?.company?.documentModel?.quotesPrefix || QUOTE_PREFIX}-${generateAmaId(notification.quote?.quoteNumber || 0, false)}`;
      case "DELIVERY_NOTE":
        return `Bon de livraison ${notification.deliveryNote?.company?.documentModel?.deliveryNotesPrefix || DELIVERY_NOTE_PREFIX}-${generateAmaId(notification.deliveryNote?.deliveryNoteNumber || 0, false)}`;
      case "RECEIPT":
        return `Transaction`;
      case "DISBURSEMENT":
        return `Transaction`;
      case "APPOINTMENT":
        return `Rendez-vous avec ${notification.appointment?.client.companyName} (${notification.appointment?.client.firstname} ${notification.appointment?.client.lastname})`;
      case "TASK":
        return `Tâche '${notification.task?.taskName}'`;
      default:
        return 'Notification';
    }
  }

  async function view(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) {
    e.preventDefault();
    const url = getLink();
    if (!isRead && onMarkAsRead) {
      onMarkAsRead(notification.id, url);
    }
  }

  function action(e: React.MouseEvent<HTMLSpanElement, MouseEvent>, state: 'validate' | 'cancel') {
    e.preventDefault();
    mutateConfirm(
      { notificationId: notification.id, action: state },
      {
        onSuccess(data) {
          if (data.data && onNotificationUpdate) {
            onNotificationUpdate(notification.id, data.data);
          }
        },
      }
    );
  }

  return (
    <div
      className={cn(
        "flex justify-between gap-x-2 py-3",
        last && "border-b",
      )}
    >
      <div className="flex gap-x-2 items-center">
        <span className={cn(
          "flex justify-center items-center size-8 rounded-full p-1.5 border",
        )}>
          <FileCheck2Icon />
        </span>
        <div className="-space-y-1 flex flex-col">
          <span
            onClick={view}
            className={cn(
              "font-semibold gap-x-1 text-blue flex items-center cursor-pointer hover:underline",)}
          >
            {getTitle()} <InfoIcon className="size-4" />
          </span>
          <p className={cn(
            "text-sm",
            isRead ? "text-neutral-400" : "text-neutral-600"
          )}>
            {content}
          </p>
        </div>
      </div>
      <div className="max-w-xs w-full flex justify-end items-start gap-x-2">
        {type === "signal" && !isRead && (
          <span
            className="bg-red-500 flex size-3 rounded-full"
            title="Non lu"
          />
        )}
        {type === "action" && notification.active && (
          <>
            {isConfirm ? <Spinner /> :
              <div className="grid grid-cols-2 gap-x-2 max-w-lg w-full">
                <Button
                  variant="primary"
                  onClick={e => action(e, 'validate')}
                  className="!h-9"
                  disabled={isConfirm}
                >
                  Yes
                </Button>
                <Button
                  variant="primary"
                  onClick={e => action(e, 'cancel')}
                  className="bg-red-500 !h-9"
                  disabled={isConfirm}
                >
                  No
                </Button>
              </div>
            }
          </>
        )}
      </div>
    </div>
  );
}