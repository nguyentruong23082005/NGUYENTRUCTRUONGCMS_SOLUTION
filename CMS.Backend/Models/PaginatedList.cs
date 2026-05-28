using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Models
{
    public class PaginatedList<T>
    {
        public IReadOnlyList<T> Items { get; }
        public int PageIndex { get; }
        public int TotalPages { get; }
        public int TotalItems { get; }
        public int PageSize { get; }

        public bool HasPreviousPage => PageIndex > 1;
        public bool HasNextPage => PageIndex < TotalPages;

        private PaginatedList(IReadOnlyList<T> items, int count, int pageIndex, int pageSize)
        {
            Items = items;
            TotalItems = count;
            PageIndex = pageIndex;
            PageSize = pageSize;
            TotalPages = (int)Math.Ceiling(count / (double)pageSize);
        }

        public static async Task<PaginatedList<T>> CreateAsync(IQueryable<T> source, int pageIndex, int pageSize)
        {
            var safePageIndex = Math.Max(pageIndex, 1);
            var safePageSize = Math.Max(pageSize, 1);
            var count = await source.CountAsync();
            var totalPages = Math.Max((int)Math.Ceiling(count / (double)safePageSize), 1);
            var normalizedPageIndex = Math.Min(safePageIndex, totalPages);
            var items = await source
                .Skip((normalizedPageIndex - 1) * safePageSize)
                .Take(safePageSize)
                .ToListAsync();

            return new PaginatedList<T>(items, count, normalizedPageIndex, safePageSize);
        }
    }
}
