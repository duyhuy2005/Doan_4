using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;

namespace CarRental.Api.Services;

public class ExpiredBookingSweepBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ExpiredBookingSweepBackgroundService> _logger;

    public ExpiredBookingSweepBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<ExpiredBookingSweepBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("🔄 Background Service: Quét và giải phóng xe quá hạn cọc đã khởi động.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var lifecycleService = scope.ServiceProvider.GetRequiredService<IBookingLifecycleService>();
                    var result = await lifecycleService.SweepExpiredBookingsAsync();
                    if (result.ExpiredCount > 0)
                    {
                        _logger.LogWarning("⚠️ Đã tự động hủy {Count} đơn quá hạn cọc: {Codes}. Xe liên quan đã được giải phóng.",
                            result.ExpiredCount, string.Join(", ", result.ExpiredBookingCodes));
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Lỗi khi thực hiện quét đơn quá hạn giữ xe tự động.");
            }

            // Quét định kỳ mỗi 30 giây
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }
    }
}
