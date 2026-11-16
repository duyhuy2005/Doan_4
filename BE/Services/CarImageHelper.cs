namespace CarRental.Api.Services;

public static class CarImageHelper
{
    public static string ResolveThumbnail(string? carName, string? rawThumbnail)
    {
        if (!string.IsNullOrEmpty(rawThumbnail) && (rawThumbnail.StartsWith("http://") || rawThumbnail.StartsWith("https://")))
        {
            return rawThumbnail;
        }

        var name = (carName ?? string.Empty).ToLower();
        if (name.Contains("vios")) return "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800";
        if (name.Contains("corolla cross")) return "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800";
        if (name.Contains("city")) return "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800";
        if (name.Contains("creta")) return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800";
        if (name.Contains("carnival")) return "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800";
        if (name.Contains("santa fe")) return "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800";
        if (name.Contains("tucson")) return "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800";
        if (name.Contains("hr-v") || name.Contains("hrv")) return "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800";
        if (name.Contains("br-v") || name.Contains("brv")) return "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800";
        if (name.Contains("seltos")) return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800";
        if (name.Contains("veloz")) return "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800";
        if (name.Contains("yaris")) return "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800";
        if (name.Contains("c300") || name.Contains("c200") || name.Contains("mercedes")) return "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800";
        if (name.Contains("camry")) return "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800";
        if (name.Contains("vf8") || name.Contains("vf 8")) return "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800";
        if (name.Contains("vf9") || name.Contains("vf 9")) return "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800";
        if (name.Contains("ranger")) return "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800";

        return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800";
    }

    public static string MapTransmission(string? raw)
    {
        return raw == "SO_SAN" ? "MANUAL" : "AUTOMATIC";
    }

    public static string MapFuelType(string? raw)
    {
        return raw switch
        {
            "DIESEL" => "DIESEL",
            "DIEN" => "ELECTRIC",
            "HYBRID" => "HYBRID",
            _ => "GASOLINE"
        };
    }

    public static string MapCarStatus(string? raw)
    {
        return raw switch
        {
            "HOAT_DONG" => "AVAILABLE",
            "DANG_THUE" => "RENTED",
            "BAO_TRI" => "MAINTENANCE",
            _ => "AVAILABLE"
        };
    }

    public static string MapBookingStatus(string? raw)
    {
        return raw switch
        {
            "CHO_XAC_NHAN" => "PENDING",
            "DA_XAC_NHAN" => "CONFIRMED",
            "CHO_HOP_DONG" => "CONTRACT_DRAFT",
            "CHO_THANH_TOAN_COC" => "AWAITING_DEPOSIT",
            "DA_DAT_COC" => "DEPOSIT_PAID",
            "SAN_SANG_GIAO" => "READY_FOR_DELIVERY",
            "DANG_THUE" => "ACTIVE",
            "CHO_TRA_XE" => "AWAITING_RETURN",
            "CHO_CHOT_HOA_DON" => "AWAITING_SETTLEMENT",
            "CHO_HOAN_COC" => "AWAITING_REFUND",
            "HOAN_THANH" => "COMPLETED",
            "HET_HAN" => "EXPIRED",
            "DA_HUY" => "CANCELLED",
            "TU_CHOI" => "REJECTED",
            _ => raw ?? "PENDING"
        };
    }

    public static int CalculateStep(string? raw)
    {
        return raw switch
        {
            "CHO_XAC_NHAN" or "PENDING" => 1,
            "DA_XAC_NHAN" or "CONFIRMED" => 2,
            "CHO_HOP_DONG" or "CONTRACT_DRAFT" => 3,
            "CHO_THANH_TOAN_COC" or "AWAITING_DEPOSIT" => 4,
            "DA_DAT_COC" or "DEPOSIT_PAID" => 5,
            "SAN_SANG_GIAO" or "READY_FOR_DELIVERY" => 6,
            "DANG_THUE" or "ACTIVE" => 7,
            "CHO_TRA_XE" or "AWAITING_RETURN" => 8,
            "CHO_CHOT_HOA_DON" or "AWAITING_SETTLEMENT" => 9,
            "CHO_HOAN_COC" or "AWAITING_REFUND" => 10,
            "HOAN_THANH" or "COMPLETED" => 11,
            "HET_HAN" or "EXPIRED" => 0,
            "DA_HUY" or "CANCELLED" => -1,
            "TU_CHOI" or "REJECTED" => -2,
            _ => 1
        };
    }

    public static string GetStepName(int step)
    {
        return step switch
        {
            1 => "1. Đặt xe",
            2 => "2. Xác nhận đơn",
            3 => "3. Tạo hợp đồng",
            4 => "4. Khách xác nhận HĐ / Chờ cọc",
            5 => "5. Thanh toán cọc",
            6 => "6. HĐ có hiệu lực / Sẵn sàng giao",
            7 => "7. Đang thuê xe",
            8 => "8. Đã trả xe / Chờ chốt hóa đơn",
            9 => "9. Chốt hóa đơn quyết toán",
            10 => "10. Đối soát và hoàn cọc",
            11 => "11. Hoàn thành",
            0 => "Hết hạn giữ xe (Quá hạn cọc)",
            -1 => "Đã hủy đơn",
            -2 => "Từ chối duyệt",
            _ => "Đang xử lý"
        };
    }
}
