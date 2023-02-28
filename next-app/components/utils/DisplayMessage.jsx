import { Box, Text, Flex } from "@chakra-ui/react";

function DisplayMessage({ message }) {
  return (
    <Box
      mt={5}
      p={5}
      maxW="720px"
      mx="auto"
      borderRadius="lg"
      bg="#222222"
      textColor="white"
    >
      <Flex direction="column" align="center">
        <Text fontWeight="semibold" fontSize="sm" mr={2}>
          {message}
        </Text>
      </Flex>
    </Box>
  );
}

export default DisplayMessage;
