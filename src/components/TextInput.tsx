import React, { useState, useRef } from "react";
import { Input, InputProps, Box, Text, HStack } from "@chakra-ui/react";

interface TextInputProps extends InputProps {
  onInputFinalized?: (value: string) => void;
  label?: string;
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ onInputFinalized, label, value: propValue, defaultValue, ...rest }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState<string>(
      propValue !== undefined
        ? String(propValue)
        : defaultValue !== undefined
        ? String(defaultValue)
        : ""
    );
    const inputRef = useRef<HTMLInputElement>(null);

    // Keep inputValue in sync with propValue if controlled
    React.useEffect(() => {
      if (propValue !== undefined) {
        setInputValue(String(propValue));
      }
    }, [propValue]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (rest.onFocus) rest.onFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (onInputFinalized) onInputFinalized(inputValue);
      if (rest.onBlur) rest.onBlur(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      if (rest.onChange) rest.onChange(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onInputFinalized) {
        onInputFinalized(inputValue);
      }
      if (rest.onKeyDown) rest.onKeyDown(e);
    };

    return (
      <Box display="flex" alignItems="center" gap={1}>
        {label && <Text fontSize="xs">{label}:</Text>}
        <Box position="relative" w="full">
          <Input
            ref={ref || inputRef}
            value={inputValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            {...rest}
          />
          {isFocused && (
            <Box
              position="absolute"
              left={0}
              right={0}
              mt={1}
              zIndex={1}
              pointerEvents="none"
            >
              <Text color="gray.500" fontSize="xs">hit enter ↳ to apply</Text>
            </Box>
            )}
        </Box>
      </Box>
    );
  }
);

TextInput.displayName = "TextInput";

export default TextInput;
