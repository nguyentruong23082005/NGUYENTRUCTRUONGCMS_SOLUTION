using CMS.Data.Entities;
using System.Collections.Generic;
using System.Linq;

namespace CMS.Backend.Helpers
{
    public static class OrderStatusHelper
    {
        private static readonly Dictionary<OrderStatus, IReadOnlyList<OrderStatus>> AllowedTransitions = new()
        {
            [OrderStatus.Pending] = new[] { OrderStatus.Confirmed, OrderStatus.Cancelled },
            [OrderStatus.Confirmed] = new[] { OrderStatus.Preparing, OrderStatus.Cancelled },
            [OrderStatus.Preparing] = new[] { OrderStatus.Ready, OrderStatus.Cancelled },
            [OrderStatus.Ready] = new[] { OrderStatus.OutForDelivery, OrderStatus.Completed },
            [OrderStatus.OutForDelivery] = new[] { OrderStatus.Delivered },
            [OrderStatus.Delivered] = new[] { OrderStatus.Completed },
            [OrderStatus.Completed] = new OrderStatus[] { },
            [OrderStatus.Cancelled] = new OrderStatus[] { }
        };

        public static bool CanTransition(OrderStatus current, OrderStatus next)
        {
            return AllowedTransitions.TryGetValue(current, out var nextStatuses)
                && nextStatuses.Contains(next);
        }

        public static IReadOnlyList<OrderStatus> GetNextStatuses(OrderStatus current)
        {
            return AllowedTransitions.TryGetValue(current, out var nextStatuses)
                ? nextStatuses
                : new OrderStatus[] { };
        }

        public static bool CanCancel(OrderStatus status)
        {
            return status == OrderStatus.Pending
                || status == OrderStatus.Confirmed
                || status == OrderStatus.Preparing;
        }

        public static string GetDisplayName(OrderStatus status)
        {
            return status switch
            {
                OrderStatus.Pending => "Chờ xác nhận",
                OrderStatus.Confirmed => "Đã xác nhận",
                OrderStatus.Preparing => "Đang pha chế",
                OrderStatus.Ready => "Sẵn sàng",
                OrderStatus.OutForDelivery => "Đang giao",
                OrderStatus.Delivered => "Đã giao",
                OrderStatus.Completed => "Hoàn thành",
                OrderStatus.Cancelled => "Đã hủy",
                _ => "Không rõ"
            };
        }

        public static string GetBadgeClass(OrderStatus status)
        {
            return status switch
            {
                OrderStatus.Pending => "badge-status-pending",
                OrderStatus.Confirmed => "badge-status-confirmed",
                OrderStatus.Preparing => "badge-status-preparing",
                OrderStatus.Ready => "badge-status-ready",
                OrderStatus.OutForDelivery => "badge-status-shipping",
                OrderStatus.Delivered => "badge-status-success",
                OrderStatus.Completed => "badge-status-success",
                OrderStatus.Cancelled => "badge-status-danger",
                _ => "badge-status-pending"
            };
        }

        public static string GetMaterialIcon(OrderStatus status)
        {
            return status switch
            {
                OrderStatus.Pending => "schedule",
                OrderStatus.Confirmed => "check_circle",
                OrderStatus.Preparing => "local_cafe",
                OrderStatus.Ready => "inventory_2",
                OrderStatus.OutForDelivery => "local_shipping",
                OrderStatus.Delivered => "mark_email_read",
                OrderStatus.Completed => "flag_circle",
                OrderStatus.Cancelled => "cancel",
                _ => "help"
            };
        }

        public static bool CanDelete(OrderStatus status)
        {
            return status == OrderStatus.Pending;
        }

        public static string GetNextActionLabel(OrderStatus current)
        {
            var nextStatuses = GetNextStatuses(current)
                .Where(status => status != OrderStatus.Cancelled)
                .ToList();

            if (nextStatuses.Count == 0)
            {
                return "Không còn bước tiếp theo";
            }

            if (nextStatuses.Count > 1)
            {
                return "Chọn bước tiếp theo";
            }

            return GetDisplayName(nextStatuses[0]);
        }

        public static string GetNextActionIcon(OrderStatus current)
        {
            var nextStatuses = GetNextStatuses(current)
                .Where(status => status != OrderStatus.Cancelled)
                .ToList();

            if (nextStatuses.Count == 0)
            {
                return "lock";
            }

            if (nextStatuses.Count > 1)
            {
                return "alt_route";
            }

            return GetMaterialIcon(nextStatuses[0]);
        }
    }
}
