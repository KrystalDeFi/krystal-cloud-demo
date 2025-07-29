// A common breadcrumbs to be used across pages

import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Text,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import Link from "next/link";

interface BreadcrumbsProps {
  items?: { label: string; href?: string }[];
  color?: string; // allow override, but default to brand.500
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, color }) => {
  return (
    <Breadcrumb
      spacing="2"
      separator={<ChevronRightIcon />}
      fontSize="sm"
      mb={4}
      color="text.secondary"
    >
      {(items ?? []).map((item, idx) => (
        <BreadcrumbItem
          key={item.href || item.label}
          isCurrentPage={idx === (items ?? []).length - 1}
          fontWeight={idx === (items ?? []).length - 1 ? "semibold" : "normal"}
        >
          {item.href ? (
            <BreadcrumbLink href={item.href} as={Link}>
              {item.label}
            </BreadcrumbLink>
          ) : (
            <Text>{item.label}</Text>
          )}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
};

export default Breadcrumbs;
