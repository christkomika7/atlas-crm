'use client';

import { useEffect, useState } from "react";
import Notification from "./notification";
import { NotificationType } from "@/types/notification.type";
import { useDataStore } from "@/stores/data.store";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { getNotifications, markNotificationAsRead } from "@/action/notification";
import { NOTIFICATION_PAGE_SIZE } from "@/config/constant";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";
import Paginations from "@/components/paginations";
import EmptyNotifications from "./empty-notifications";
import { useRouter } from "next/navigation";
import { getUser } from "@/action/user.action";
import { PermissionType, ProfileType } from "@/types/user.types";
import { getSession } from "@/lib/auth-client";
import { Resource } from "@/lib/generated/prisma";

export default function Notifications() {
  const session = getSession();
  const profileId = session.data?.user.currentProfile;
  const isAdmin = session.data?.user.role === 'ADMIN';
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [permissions, setPermissions] = useState<PermissionType[]>([]);

  const companyId = useDataStore.use.currentCompany();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(NOTIFICATION_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState<number>(0);

  const skip = (currentPage - 1) * pageSize;

  const { access: readAccess, loading } = useAccess("DASHBOARD", "READ");

  const { mutate, isPending } = useQueryAction<
    { companyId: string, skip?: number, take?: number },
    RequestResponse<NotificationType[]>
  >(getNotifications, () => { }, "notifications");

  const { mutate: mutateGetProfil, isPending: isGettingUser } = useQueryAction<
    { id: string },
    RequestResponse<ProfileType>
  >(getUser, () => { }, "profil");

  const { mutate: mutateMarkAsRead, isPending: isMarkingAsRead } = useQueryAction<
    { notificationId: string },
    RequestResponse<null>
  >(markNotificationAsRead, () => { }, "notifications");

  useEffect(() => {
    if (companyId && readAccess) {
      mutate({ companyId, skip, take: pageSize }, {
        onSuccess(data) {
          if (data.data) {
            setNotifications(data.data);
            setTotalItems(data.total);
          }
        },
      });
    }
  }, [companyId, readAccess, skip, pageSize]);

  useEffect(() => {
    if (profileId && readAccess && !isAdmin) {
      mutateGetProfil({ id: profileId }, {
        onSuccess(data) {
          if (data.data) {
            setPermissions(data.data.permissions);
          }
        },
      });
    }
  }, [profileId, readAccess, isAdmin]);

  function getResourceFromNotificationKind(kind: string): Resource | null {
    const mapping: Record<string, Resource> = {
      INVOICE: "INVOICES",
      PURCHASE_ORDER: "PURCHASE_ORDER",
      QUOTE: "QUOTES",
      DELIVERY_NOTE: "DELIVERY_NOTES",
      RECEIPT: "TRANSACTION",
      DISBURSEMENT: "TRANSACTION",
      TRANSFER: 'TRANSACTION',
      APPOINTMENT: "APPOINTMENT",
      TASK: "PROJECTS",
      PROJECT: "PROJECTS",
    };
    return mapping[kind] || null;
  }

  function hasPermissionForNotification(notification: NotificationType): boolean {
    // Les admins ont accès à toutes les notifications
    if (isAdmin) return true;

    const resource = getResourceFromNotificationKind(notification.for);

    if (!resource) return false;

    const permission = permissions.find(p => p.resource === resource);

    if (!permission) return false;

    // Pour les notifications de type CONFIRM, vérifier MODIFY
    if (notification.type === "CONFIRM") {
      return permission.actions.includes("MODIFY");
    }

    // Pour les notifications de type ALERT, vérifier au minimum READ
    return permission.actions.includes("READ");
  }

  const filteredNotifications = notifications.filter(notification =>
    hasPermissionForNotification(notification)
  );

  function markAsView(notificationId: string, url?: string) {
    mutateMarkAsRead({ notificationId }, {
      onSuccess() {
        if (url) {
          router.push(url);
        }
      },
    });
  }

  function updateNotificationAfterAction(notificationId: string, updatedNotification: NotificationType) {
    console.log({ notificationId, updatedNotification })
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? updatedNotification : notif
      )
    );
  }

  return (
    <AccessContainer hasAccess={readAccess} resource="DASHBOARD" loading={loading || isPending}>
      {(!isPending && filteredNotifications.length === 0) && <EmptyNotifications />}
      {filteredNotifications.length > 0 &&
        <>
          <div className="border border-neutral-200 rounded-xl p-4 space-y-2">
            {filteredNotifications.map((notification, index) => (
              <Notification
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsView}
                onNotificationUpdate={updateNotificationAfterAction}
                last={filteredNotifications.length > 1 && (index + 1) < filteredNotifications.length}
              />
            ))}
          </div>
          <div className="flex justify-end p-4">
            <Paginations
              totalItems={totalItems}
              pageSize={pageSize}
              controlledPage={currentPage}
              onPageChange={(page) => setCurrentPage(page)}
              maxVisiblePages={NOTIFICATION_PAGE_SIZE}
            />
          </div>
        </>
      }
    </AccessContainer>
  );
}