using IM_backend.Dtos;
using IM_backend.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using SkiaSharp;
using System.Text;

namespace IM_backend.Services
{
    public class CaptchaService : ICaptchaService
    {
        private readonly IDistributedCache _cache;
        private readonly ILogger<CaptchaService> _logger;
        private readonly Random _random = new Random();
        private const int CAPTCHA_LENGTH = 4;
        private const int EXPIRY_MINUTES = 3;

        public CaptchaService(IDistributedCache cache, ILogger<CaptchaService> logger)
        {
            _cache = cache;
            _logger = logger;
        }

        public CaptchaDto GenerateCaptcha()
        {
            var code = GenerateRandomCode(CAPTCHA_LENGTH);
            var captchaId = Guid.NewGuid().ToString("N");

            StoreInRedis(captchaId, code);
            var imageBytes = GenerateCaptchaImage(code);

            return new CaptchaDto
            {
                Id = captchaId,
                Code = code,
                ImageBytes = imageBytes
            };
        }

        private string GenerateRandomCode(int length)
        {
            //const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            const string chars = "123456789";
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[_random.Next(s.Length)]).ToArray());
        }

        private void StoreInRedis(string captchaId, string code)
        {
            try
            {
                var options = new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(EXPIRY_MINUTES)
                };

                _cache.SetString(captchaId, code, options);
                _logger.LogInformation($"CAPTCHA stored in Redis with ID: {captchaId}, Code: {code}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error storing CAPTCHA in Redis: {captchaId}");
                throw new InvalidOperationException("Redis cache is not available. Please ensure Redis is running and configured correctly.", ex);
            }
        }

        private byte[] GenerateCaptchaImage(string code)
        {
            int width = 250;
            int height = 80;

            using var surface = SKSurface.Create(new SKImageInfo(width, height));
            var canvas = surface.Canvas;

            using var bgPaint = new SKPaint
            {
                Color = SKColors.White,
                Style = SKPaintStyle.Fill
            };
            canvas.DrawRect(0, 0, width, height, bgPaint);

            AddNoiseLines(canvas, width, height);
            DrawCaptchaText(canvas, code, width, height);
            AddNoiseDots(canvas, width, height);

            using var image = surface.Snapshot();
            using var data = image.Encode(SKEncodedImageFormat.Png, 80);
            return data.ToArray();
        }

        private void AddNoiseLines(SKCanvas canvas, int width, int height)
        {
            using var paint = new SKPaint
            {
                Style = SKPaintStyle.Stroke,
                StrokeWidth = 2,
                IsAntialias = true
            };

            for (int i = 0; i < 5; i++)
            {
                paint.Color = new SKColor(
                    (byte)_random.Next(100, 200),
                    (byte)_random.Next(100, 200),
                    (byte)_random.Next(100, 200)
                );

                canvas.DrawLine(
                    _random.Next(0, width),
                    _random.Next(0, height),
                    _random.Next(0, width),
                    _random.Next(0, height),
                    paint
                );
            }
        }

        private void DrawCaptchaText(SKCanvas canvas, string code, int width, int height)
        {
            int charCount = code.Length;
            int charWidth = width / (charCount + 1);

            for (int i = 0; i < charCount; i++)
            {
                float fontSize = _random.Next(30, 45);
                float rotation = _random.Next(-25, 25);

                using var paint = new SKPaint
                {
                    Style = SKPaintStyle.Fill,
                    IsAntialias = true,
                    Color = new SKColor(
                        (byte)_random.Next(20, 80),
                        (byte)_random.Next(20, 80),
                        (byte)_random.Next(20, 80)
                    )
                };

                using var typeface = SKTypeface.FromFamilyName("Arial");
                using var textBlob = SKTextBlob.Create(code[i].ToString(), new SKFont(typeface, fontSize));

                float x = (i + 1) * charWidth + _random.Next(-5, 5);
                float y = height / 2 + fontSize / 2 + _random.Next(-10, 10);

                canvas.Save();
                canvas.Translate(x, y);
                canvas.RotateDegrees(rotation);

                canvas.DrawText(textBlob, 0, 0, paint);

                canvas.Restore();
            }
        }

        private void AddNoiseDots(SKCanvas canvas, int width, int height)
        {
            using var paint = new SKPaint { Style = SKPaintStyle.Fill };

            for (int i = 0; i < 100; i++)
            {
                paint.Color = new SKColor(
                    (byte)_random.Next(0, 255),
                    (byte)_random.Next(0, 255),
                    (byte)_random.Next(0, 255)
                );

                canvas.DrawCircle(
                    _random.Next(0, width),
                    _random.Next(0, height),
                    _random.Next(1, 3),
                    paint
                );
            }
        }

        public CaptchaValidationResult ValidateCaptcha(string captchaId, string userInput)
        {
            if (string.IsNullOrEmpty(captchaId) || string.IsNullOrEmpty(userInput))
                return CaptchaValidationResult.Invalid;

            try
            {
                _logger.LogInformation($"Attempting to validate CAPTCHA with ID: {captchaId}, User Input: {userInput}");
                var storedCode = _cache.GetString(captchaId);

                _logger.LogInformation($"Stored code from Redis: {(string.IsNullOrEmpty(storedCode) ? "NULL/EMPTY" : storedCode)} for CAPTCHA ID: {captchaId}");

                if (string.IsNullOrEmpty(storedCode))
                {
                    _logger.LogWarning($"CAPTCHA not found in Redis (expired): {captchaId}");
                    return CaptchaValidationResult.Expired;
                }

                bool isValid = storedCode.Equals(userInput, StringComparison.OrdinalIgnoreCase);

                if (isValid)
                {
                    _cache.Remove(captchaId);
                    _logger.LogInformation($"CAPTCHA validated and removed: {captchaId}");
                    return CaptchaValidationResult.Valid;
                }
                else
                {
                    _logger.LogWarning($"Invalid CAPTCHA attempt: {captchaId}. Expected: {storedCode}, Got: {userInput}");
                    return CaptchaValidationResult.Invalid;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error validating CAPTCHA: {captchaId}");
                return CaptchaValidationResult.Invalid;
            }
        }
    }
}
