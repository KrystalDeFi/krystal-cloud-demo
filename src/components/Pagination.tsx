"use client";
import React from "react";
import {
  Box,
  HStack,
  Button,
  Text,
  Select,
  Flex,
  useColorModeValue,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

interface IPaginationProps {
  currentPage: number;
  totalItems?: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showFirstLastButtons?: boolean;
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = true,
  showFirstLastButtons = true,
}: IPaginationProps) {
  const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : null;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (currentPage <= 3) {
      pages.push(...[1, 2, 3]);
    }
    if (currentPage > 3) {
      pages.push(...[1, "...", currentPage - 1, currentPage, currentPage + 1]);
    }
    if (!!totalPages) {
      if (totalPages > currentPage + 2) {
        pages.push("...");
      }
      if (totalPages > currentPage + 1) {
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (totalPages != null && totalPages <= 1) {
    return null;
  }

  return (
    <Box>
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        gap={4}
      >
        {/* Item count and page size selector */}
        <Flex
          direction={{ base: "column", sm: "row" }}
          align={{ base: "stretch", sm: "center" }}
          gap={3}
        >
          {showPageSizeSelector && (
            <HStack spacing={2}>
              <Text fontSize="sm" color="text.secondary">
                Show:
              </Text>
              <Select
                value={pageSize.toString()}
                onChange={e => onPageSizeChange(parseInt(e.target.value))}
                size="sm"
                w="80px"
                bg="bg.primary"
                borderColor="border.primary"
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </Select>
              <Text fontSize="sm" color="text.secondary">
                per page
              </Text>
            </HStack>
          )}
        </Flex>

        {/* Pagination controls */}
        <HStack spacing={1}>
          {/* First page button */}
          {showFirstLastButtons && (
            <Tooltip label="First page">
              <IconButton
                aria-label="Go to first page"
                icon={<ChevronLeftIcon />}
                onClick={() => onPageChange(1)}
                isDisabled={currentPage === 1}
                size="sm"
                variant="outline"
              />
            </Tooltip>
          )}

          {/* Previous page button */}
          <Tooltip label="Previous page">
            <IconButton
              aria-label="Go to previous page"
              icon={<ChevronLeftIcon />}
              onClick={() => onPageChange(currentPage - 1)}
              isDisabled={currentPage === 1}
              size="sm"
              variant="outline"
            />
          </Tooltip>

          {/* Page numbers */}
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === "..." ? (
                <Text px={3} py={2} fontSize="sm" color="text.muted">
                  ...
                </Text>
              ) : (
                <Button
                  onClick={() => onPageChange(page as number)}
                  size="sm"
                  variant={currentPage === page ? "solid" : "outline"}
                  minW="40px"
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}

          {/* Next page button */}
          <Tooltip label="Next page">
            <IconButton
              aria-label="Go to next page"
              icon={<ChevronRightIcon />}
              onClick={() => onPageChange(currentPage + 1)}
              isDisabled={currentPage === totalPages}
              size="sm"
              variant="outline"
            />
          </Tooltip>

          {/* Last page button */}
          {showFirstLastButtons && !!totalPages && (
            <Tooltip label="Last page">
              <IconButton
                aria-label="Go to last page"
                icon={<ChevronRightIcon />}
                onClick={() => onPageChange(totalPages)}
                isDisabled={currentPage === totalPages}
                size="sm"
                variant="outline"
              />
            </Tooltip>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}
