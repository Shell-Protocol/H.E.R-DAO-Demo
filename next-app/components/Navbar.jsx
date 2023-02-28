import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Flex, Text } from "@chakra-ui/react";

import React from "react";

const Navbar = () => {
  return (
    <div>
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        bg="teal.500"
        p={4}
        color="white"
      >
        <Text fontWeight="bold"></Text>

        <ConnectButton
          accountStatus={"avatar"}
          showBalance={false}
          chainStatus={"icon"}
        />
      </Flex>
    </div>
  );
};

export default Navbar;
