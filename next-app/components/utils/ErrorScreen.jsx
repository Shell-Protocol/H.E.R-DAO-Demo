import { Box, Heading, Text } from "@chakra-ui/react";

function ErrorScreen({ errorMessage }) { // is currently not being used
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      height="100vh"
    >
      <Box display="flex">
        <Heading as="h2" size="lg" color="red.400" mt="10px">
          Error
        </Heading>
      </Box>
      <Text color="red.400" mt="10px">
        {errorMessage}
      </Text>
    </Box>
  );
}

export default ErrorScreen;
