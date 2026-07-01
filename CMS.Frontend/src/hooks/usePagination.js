import { useState, useMemo } from 'react';

/**
 * Hook phân trang dữ liệu phía client
 * @param {Array} data - Mảng dữ liệu cần phân trang
 * @param {number} itemsPerPage - Số phần tử mỗi trang (mặc định 12)
 * @returns {{ currentPage, totalPages, paginatedData, goToPage, nextPage, prevPage }}
 */
export const usePagination = (data = [], itemsPerPage = 12) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const goToPage = (page) => {
    const pageNum = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNum);
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  return { currentPage, totalPages, paginatedData, goToPage, nextPage, prevPage };
};

export default usePagination;
