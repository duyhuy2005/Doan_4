using Microsoft.AspNetCore.Mvc;
using CarRental.Api.DTOs;

namespace CarRental.Api.Controllers;

[ApiController]
[Route("api/upload")]
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".pdf"
    };

    public UploadController(IWebHostEnvironment env)
    {
        _env = env;
    }

    [HttpPost]
    public async Task<IActionResult> UploadFile(IFormFile? file, [FromQuery] string folder = "handovers")
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<object>.Fail("Vui lòng chọn tệp tin cần tải lên."));
        }

        if (file.Length > 10 * 1024 * 1024)
        {
            return BadRequest(ApiResponse<object>.Fail("Kích thước tệp vượt quá giới hạn cho phép (tối đa 10MB)."));
        }

        string ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
        {
            return BadRequest(ApiResponse<object>.Fail("Định dạng tệp không được hỗ trợ. Chỉ chấp nhận .jpg, .jpeg, .png, .webp, .pdf."));
        }

        string sanitizedFolder = folder.ToLowerInvariant() switch
        {
            "documents" => "documents",
            "cars" => "cars",
            _ => "handovers"
        };

        string webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        string targetDir = Path.Combine(webRoot, "uploads", sanitizedFolder);
        Directory.CreateDirectory(targetDir);

        string uniqueFileName = $"{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid():N[..8]}{ext}";
        string filePath = Path.Combine(targetDir, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        string relativeUrl = $"/uploads/{sanitizedFolder}/{uniqueFileName}";

        return Ok(ApiResponse<object>.Ok(new
        {
            url = relativeUrl,
            fileName = uniqueFileName,
            originalName = file.FileName,
            size = file.Length,
            uploadedAt = DateTime.UtcNow
        }, "Tải lên tệp thành công"));
    }

    [HttpPost("multiple")]
    public async Task<IActionResult> UploadMultipleFiles([FromForm] List<IFormFile> files, [FromQuery] string folder = "handovers")
    {
        if (files == null || files.Count == 0)
        {
            return BadRequest(ApiResponse<object>.Fail("Vui lòng chọn ít nhất một tệp tin."));
        }

        var results = new List<object>();
        string sanitizedFolder = folder.ToLowerInvariant() switch
        {
            "documents" => "documents",
            "cars" => "cars",
            _ => "handovers"
        };

        string webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        string targetDir = Path.Combine(webRoot, "uploads", sanitizedFolder);
        Directory.CreateDirectory(targetDir);

        foreach (var file in files)
        {
            if (file.Length == 0 || file.Length > 10 * 1024 * 1024) continue;
            string ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(ext)) continue;

            string uniqueFileName = $"{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid():N[..8]}{ext}";
            string filePath = Path.Combine(targetDir, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            results.Add(new
            {
                url = $"/uploads/{sanitizedFolder}/{uniqueFileName}",
                fileName = uniqueFileName,
                originalName = file.FileName,
                size = file.Length
            });
        }

        return Ok(ApiResponse<object>.Ok(results, $"Đã tải lên thành công {results.Count} tệp."));
    }
}
