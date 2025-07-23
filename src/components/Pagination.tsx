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
import { IPaginationProps } from "../common/config";

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
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  
  const buttonBg = useColorModeValue("white", "gray.800");
  const buttonBorderColor = useColorModeValue("gray.200", "gray.700");
  const activeButtonBg = useColorModeValue("brand.500", "brand.400");
  const activeButtonColor = "white";

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7; // Show max 7 page numbers
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination with ellipsis
      if (currentPage <= 4) {
        // Near the beginning
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Near the end
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) {
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
              <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                Show:
              </Text>
              <Select
                value={pageSize.toString()}
                onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
                size="sm"
                w="80px"
                bg={buttonBg}
                borderColor={buttonBorderColor}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </Select>
              <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
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
                bg={buttonBg}
                borderColor={buttonBorderColor}
                _hover={{
                  bg: useColorModeValue("gray.100", "gray.700"),
                }}
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
              bg={buttonBg}
              borderColor={buttonBorderColor}
              _hover={{
                bg: useColorModeValue("gray.100", "gray.700"),
              }}
            />
          </Tooltip>

          {/* Page numbers */}
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === "..." ? (
                <Text
                  px={3}
                  py={2}
                  fontSize="sm"
                  color="gray.500"
                  _dark={{ color: "gray.400" }}
                >
                  ...
                </Text>
              ) : (
                <Button
                  onClick={() => onPageChange(page as number)}
                  size="sm"
                  variant={currentPage === page ? "solid" : "outline"}
                  bg={currentPage === page ? activeButtonBg : buttonBg}
                  color={currentPage === page ? activeButtonColor : "inherit"}
                  borderColor={buttonBorderColor}
                  _hover={{
                    bg: currentPage === page 
                      ? useColorModeValue("brand.600", "brand.300")
                      : useColorModeValue("gray.100", "gray.700"),
                  }}
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
              bg={buttonBg}
              borderColor={buttonBorderColor}
              _hover={{
                bg: useColorModeValue("gray.100", "gray.700"),
              }}
            />
          </Tooltip>

          {/* Last page button */}
          {showFirstLastButtons && (
            <Tooltip label="Last page">
              <IconButton
                aria-label="Go to last page"
                icon={<ChevronRightIcon />}
                onClick={() => onPageChange(totalPages)}
                isDisabled={currentPage === totalPages}
                size="sm"
                variant="outline"
                bg={buttonBg}
                borderColor={buttonBorderColor}
                _hover={{
                  bg: useColorModeValue("gray.100", "gray.700"),
                }}
              />
            </Tooltip>
          )}
        </HStack>
      </Flex>
    </Box>
  );
} 