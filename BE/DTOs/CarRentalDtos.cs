namespace CarRental.Api.DTOs;

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class UserDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = "CUSTOMER";
    public string? AvatarUrl { get; set; }
    public string Status { get; set; } = "ACTIVE";
}

public class AuthResponse
{
    public UserDto User { get; set; } = null!;
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
}

public class BrandDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Country { get; set; }
    public string? LogoUrl { get; set; }
}

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class BranchDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? City { get; set; }
}

public class FeatureDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = "Shield";
}

public class ServiceDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string ChargeType { get; set; } = "PER_TRIP";
    public string? Description { get; set; }
}

public class PromotionDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int DiscountPercentage { get; set; }
    public decimal? DiscountAmountMax { get; set; }
    public decimal? MinOrderValue { get; set; }
    public bool IsActive { get; set; } = true;
}

public class ValidatePromoRequest
{
    public string Code { get; set; } = string.Empty;
    public decimal OrderAmount { get; set; } = 0;
}

public class CarDto
{
    public int Id { get; set; }
    public string CarName { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public decimal DailyPrice { get; set; }
    public decimal DepositRequired { get; set; }
    public int Seats { get; set; } = 5;
    public string Transmission { get; set; } = "AUTOMATIC";
    public string FuelType { get; set; } = "GASOLINE";
    public string FuelConsumption { get; set; } = "7.0 L/100km";
    public int MileageLimitPerDay { get; set; } = 300;
    public decimal ExtraMileageCharge { get; set; } = 5000;
    public int CurrentMileage { get; set; }
    public string ThumbnailUrl { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = "AVAILABLE";
    public bool IsFeatured { get; set; } = true;
    public int BrandId { get; set; }
    public int CategoryId { get; set; }
    public BrandDto? Brand { get; set; }
    public CategoryDto? Category { get; set; }
    public List<FeatureDto> Features { get; set; } = new();
    public List<string> Images { get; set; } = new();
}

public class PriceCalculationRequest
{
    public int CarId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<int> SelectedServices { get; set; } = new();
    public string? PromotionCode { get; set; }
}

public class PriceCalculationResponse
{
    public int TotalDays { get; set; }
    public decimal DailyPrice { get; set; }
    public decimal CarRentalFee { get; set; }
    public decimal ServiceFee { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal EstimatedTotalFee { get; set; }
    public decimal DepositAmount { get; set; }
    public decimal RequiredInitialPayment { get; set; }
}

public class CreateBookingRequest
{
    public int CarId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? PickupLocation { get; set; }
    public string? ReturnLocation { get; set; }
    public List<int> SelectedServices { get; set; } = new();
    public string? PromotionCode { get; set; }
    public string? Notes { get; set; }
}

public class BookingDto
{
    public string Id { get; set; } = string.Empty;
    public string BookingCode { get; set; } = string.Empty;
    public int CarId { get; set; }
    public int? UserId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalDays { get; set; }
    public decimal DailyPrice { get; set; }
    public decimal CarRentalFee { get; set; }
    public decimal ServiceFee { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal DepositAmount { get; set; }
    public decimal TotalPrice { get; set; }
    public string BookingStatus { get; set; } = "PENDING";
    public string PaymentStatus { get; set; } = "UNPAID";
    public bool ContractSigned { get; set; } = false;
    public string? PickupLocation { get; set; }
    public string? ReturnLocation { get; set; }
    public string? Notes { get; set; }
    public string? StaffNotes { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? DepositDeadline { get; set; }
    public bool IsExpired { get; set; } = false;
    public int Step { get; set; } = 1;
    public string? StepName { get; set; }
    public string? ContractId { get; set; }
    public string? ContractCode { get; set; }
    public string? ContractStatus { get; set; }
    public decimal? PaidDeposit { get; set; }
    public decimal? ExtraCharges { get; set; }
    public bool HasHandoverCheckIn { get; set; } = false;
    public bool HasHandoverCheckOut { get; set; } = false;
    public bool IsDepositRefunded { get; set; } = false;
    public CarDto? Car { get; set; }
    public UserDto? User { get; set; }
}

public class BookingHistoryDto
{
    public long Id { get; set; }
    public long BookingId { get; set; }
    public string? PreviousStatus { get; set; }
    public string NewStatus { get; set; } = string.Empty;
    public string? ActorName { get; set; }
    public string? Reason { get; set; }
    public DateTime ActionTime { get; set; }
    public string FormattedTime => ActionTime.ToString("dd/MM/yyyy HH:mm:ss");
}

public class SweepExpiredResponse
{
    public int ExpiredCount { get; set; }
    public List<string> ExpiredBookingCodes { get; set; } = new();
    public string Message { get; set; } = string.Empty;
}

public class StepTransitionRequest
{
    public string? StaffName { get; set; }
    public string? Notes { get; set; }
    public decimal? Amount { get; set; }
    public string? PaymentMethod { get; set; }
    public int? CurrentMileage { get; set; }
    public decimal? FuelPercentage { get; set; }
    public decimal? DamagePenalty { get; set; }
    public decimal? RefundAmount { get; set; }
    public decimal? HoldAmountForFines { get; set; }
}

public class ContractDto
{
    public string Id { get; set; } = string.Empty;
    public string ContractCode { get; set; } = string.Empty;
    public string BookingId { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string? CitizenId { get; set; }
    public string? DriverLicenseNo { get; set; }
    public string? CarName { get; set; }
    public string? LicensePlate { get; set; }
    public decimal TotalPrice { get; set; }
    public decimal DepositAmount { get; set; }
    public string Status { get; set; } = "DA_KY";
    public DateTime? SignedAt { get; set; }
}

public class SignContractRequest
{
    public string BookingId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? CitizenId { get; set; }
    public string? DriverLicenseNo { get; set; }
}

public class PaymentIntentRequest
{
    public string BookingId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = "VNPAY";
    public string PaymentType { get; set; } = "DEPOSIT";
}

public class ConfirmPaymentRequest
{
    public string BookingId { get; set; } = string.Empty;
    public string TransactionCode { get; set; } = string.Empty;
}

public class PaymentDto
{
    public string Id { get; set; } = string.Empty;
    public string TransactionCode { get; set; } = string.Empty;
    public string BookingId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = "VNPAY";
    public string PaymentType { get; set; } = "DEPOSIT";
    public string Status { get; set; } = "SUCCESS";
    public DateTime PaidAt { get; set; } = DateTime.UtcNow;
}

public class HandoverDto
{
    public string Id { get; set; } = string.Empty;
    public string BookingId { get; set; } = string.Empty;
    public string HandoverType { get; set; } = "CHECK_IN";
    public int CurrentMileage { get; set; }
    public int FuelPercentage { get; set; }
    public string? ConditionNotes { get; set; }
    public decimal ExtraCharge { get; set; }
    public decimal DepositRefundAmount { get; set; }
    public DateTime HandoverTime { get; set; }
}

public class AdminDashboardDto
{
    public int TotalCars { get; set; }
    public int AvailableCars { get; set; }
    public int RentedCars { get; set; }
    public int TotalUsers { get; set; }
    public int TotalBookings { get; set; }
    public int ActiveBookings { get; set; }
    public decimal TotalRevenue { get; set; }
}

public class MaintenanceDto
{
    public long Id { get; set; }
    public int CarId { get; set; }
    public string CarName { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public string Type { get; set; } = "Bảo dưỡng định kỳ";
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Cost { get; set; }
    public string Status { get; set; } = "COMPLETED";
    public string Technician { get; set; } = "Vũ Văn Nam";
    public string? Notes { get; set; }
}

public class CreateMaintenanceRequest
{
    public int CarId { get; set; }
    public string? Type { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Cost { get; set; }
    public string? Status { get; set; } = "IN_PROGRESS";
    public string? Notes { get; set; }
}

public class ReviewReplyRequest
{
    public string ReplyText { get; set; } = string.Empty;
}

public class CreateReviewRequest
{
    public long BookingId { get; set; }
    public int CarId { get; set; }
    public int Rating { get; set; } = 5;
    public string? Title { get; set; }
    public string? Comment { get; set; }
}

public class ReviewDto
{
    public long Id { get; set; }
    public long BookingId { get; set; }
    public int CarId { get; set; }
    public string CarName { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public int Rating { get; set; } = 5;
    public string? Title { get; set; }
    public string? Comment { get; set; }
    public string? StaffResponse { get; set; }
    public DateTime? CreatedAt { get; set; }
}

public class ExtendBookingRequest
{
    public DateTime NewEndDate { get; set; }
    public string? Notes { get; set; }
}

public class ExtendBookingResponse
{
    public long BookingId { get; set; }
    public DateTime OldEndDate { get; set; }
    public DateTime NewEndDate { get; set; }
    public int AdditionalDays { get; set; }
    public decimal AdditionalFee { get; set; }
    public decimal NewTotalPrice { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class ReleaseTrafficHoldRequest
{
    public decimal? Amount { get; set; }
    public string? PaymentMethod { get; set; }
    public decimal? DeductionForFines { get; set; }
    public string? Notes { get; set; }
}

public class NotificationDto
{
    public long Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Type { get; set; } = "INFO";
    public string? RelatedTarget { get; set; }
    public long? TargetId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public string TimeAgo { get; set; } = string.Empty;
}

public class HandoverPhotoDto
{
    public int Id { get; set; }
    public long HandoverId { get; set; }
    public string PhotoType { get; set; } = "TRUOC";
    public string PhotoUrl { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

