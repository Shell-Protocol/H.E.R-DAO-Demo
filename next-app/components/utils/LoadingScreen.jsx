import { Spinner, Box } from "@chakra-ui/react";

const LoadingScreen = () => (
  <Box mt={10} display="flex" justifyContent="center" height="100vh">
    <Spinner size="xl" color="teal.500" />
  </Box>
);

export default LoadingScreen;
