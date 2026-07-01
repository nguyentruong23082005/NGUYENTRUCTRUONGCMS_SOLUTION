using Microsoft.AspNetCore.Mvc.ModelBinding;
using System;
using System.Globalization;
using System.Threading.Tasks;

namespace CMS.Backend.ModelBinders
{
    public class InvariantDoubleModelBinder : IModelBinder
    {
        public Task BindModelAsync(ModelBindingContext bindingContext)
        {
            if (bindingContext == null)
            {
                throw new ArgumentNullException(nameof(bindingContext));
            }

            var valueProviderResult = bindingContext.ValueProvider.GetValue(bindingContext.ModelName);
            if (valueProviderResult == ValueProviderResult.None)
            {
                return Task.CompletedTask;
            }

            bindingContext.ModelState.SetModelValue(bindingContext.ModelName, valueProviderResult);

            var valueStr = valueProviderResult.FirstValue;
            if (string.IsNullOrWhiteSpace(valueStr))
            {
                bindingContext.Result = ModelBindingResult.Success(null);
                return Task.CompletedTask;
            }

            // Chuẩn hóa dấu phẩy thành dấu chấm để parse InvariantCulture chính xác
            string normalizedValue = valueStr.Replace(',', '.').Trim();

            if (double.TryParse(normalizedValue, NumberStyles.Any, CultureInfo.InvariantCulture, out double result))
            {
                bindingContext.Result = ModelBindingResult.Success(result);
            }
            else
            {
                bindingContext.ModelState.TryAddModelError(
                    bindingContext.ModelName,
                    $"Giá trị '{valueStr}' không phải là số thực hợp lệ.");
            }

            return Task.CompletedTask;
        }
    }

    public class InvariantDoubleModelBinderProvider : IModelBinderProvider
    {
        public IModelBinder? GetBinder(ModelBinderProviderContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            if (context.Metadata.ModelType == typeof(double) || context.Metadata.ModelType == typeof(double?))
            {
                return new InvariantDoubleModelBinder();
            }

            return null;
        }
    }
}
