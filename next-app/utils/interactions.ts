import { HashZero as NullMetadata, MaxUint256, AddressZero } from '@ethersproject/constants'
import { hexZeroPad } from "@ethersproject/bytes"
import { BigNumber } from "@ethersproject/bignumber";
import { packInteractionTypeAndAddress, numberWithFixedDecimals } from "./utils";
import { OCEAN_NORMALIZED_DECIMALS, WRAPPED_ETHER_ID } from "./constants";

import {
    BigNumberish, Interaction, InteractionCode
} from "./types"

const wrapERC20 = (address: string, amount: BigNumberish): Interaction => {
    const interactionTypeAndAddress = packInteractionTypeAndAddress(
        InteractionCode.Erc20Wrap,
        address
    );
    return {
        interactionTypeAndAddress: interactionTypeAndAddress,
        inputToken: 0,
        outputToken: 0,
        specifiedAmount: amount,
        metadata: NullMetadata
    };
}

const unitWrapERC20 = (address: string, amount: BigNumberish): Interaction => {
    const interactionTypeAndAddress = packInteractionTypeAndAddress(
        InteractionCode.Erc20Wrap,
        address
    );

    let unitAmount;
    if (BigNumber.from(amount).eq(MaxUint256)) {
        unitAmount = amount
    } else {
        unitAmount = numberWithFixedDecimals(
            amount,
            OCEAN_NORMALIZED_DECIMALS
        );
    }

    return {
        interactionTypeAndAddress: interactionTypeAndAddress,
        inputToken: 0,
        outputToken: 0,
        specifiedAmount: unitAmount,
        metadata: NullMetadata
    };
}

const wrapERC721 = (address: string, id: string): Interaction => {
    const interactionTypeAndAddress = packInteractionTypeAndAddress(
        InteractionCode.Erc721Wrap,
        address
    );
    return {
        interactionTypeAndAddress: interactionTypeAndAddress,
        inputToken: 0,
        outputToken: 0,
        specifiedAmount: 1,
        metadata: hexZeroPad(id, 32)
    };
}

const wrapERC1155 = (
    address: string,
    id: string,
    amount: BigNumberish
): Interaction => {
    const interactionTypeAndAddress = packInteractionTypeAndAddress(
        InteractionCode.Erc1155Wrap,
        address
    );
    return {
        interactionTypeAndAddress: interactionTypeAndAddress,
        inputToken: 0,
        outputToken: 0,
        specifiedAmount: amount,
        metadata: hexZeroPad(id, 32)
    };
}

const unwrapERC20 = (address: string, amount: BigNumberish): Interaction => {
    const interactionTypeAndAddress = packInteractionTypeAndAddress(
        InteractionCode.Erc20Unwrap,
        address
    );
    return {
        interactionTypeAndAddress: interactionTypeAndAddress,
        inputToken: 0,
        outputToken: 0,
        specifiedAmount: amount,
        metadata: NullMetadata
    };
}

const unitUnwrapERC20 = (address: string, amount: BigNumberish): Interaction => {
    const interactionTypeAndAddress = packInteractionTypeAndAddress(
        InteractionCode.Erc20Unwrap,
        address
    );

    let unitAmount;
    if (BigNumber.from(amount).eq(MaxUint256)) {
        unitAmount = amount
    } else {
        unitAmount = numberWithFixedDecimals(
            amount,
            OCEAN_NORMALIZED_DECIMALS
        );
    }

    return {
        interactionTypeAndAddress: interactionTypeAndAddress,
        inputToken: 0,
        outputToken: 0,
        specifiedAmount: unitAmount,
        metadata: NullMetadata
    };
}

const unwrapERC721 = (address: string, id: string): Interaction => {
    const interactionTypeAndAddress = packInteractionTypeAndAddress(
        InteractionCode.Erc721Unwrap,
        address
    );
    return {
        interactionTypeAndAddress: interactionTypeAndAddress,
        inputToken: 0,
        outputToken: 0,
        specifiedAmount: 1,
        metadata: hexZeroPad(id, 32)
    };
}

const unwrapERC1155 = (
    address: string, id: string, amount: BigNumberish
): Interaction => {
    const interactionTypeAndAddress = packInteractionTypeAndAddress(
        InteractionCode.Erc1155Unwrap,
        address
    );
    return {
        interactionTypeAndAddress: interactionTypeAndAddress,
        inputToken: 0,
        outputToken: 0,
        specifiedAmount: amount,
        metadata: hexZeroPad(id, 32)
    };
}

const computeOutputAmount = (
    address: string,
    inputToken: BigNumberish,
    outputToken: BigNumberish,
    specifiedAmount: BigNumberish,
    metadata: string
): Interaction => {
    const interactionTypeAndAddress = packInteractionTypeAndAddress(
        InteractionCode.ComputeOutputAmount,
        address
    );
    return {
        interactionTypeAndAddress,
        inputToken,
        outputToken,
        specifiedAmount,
        metadata
    };
}

const computeInputAmount = (
    address: string,
    inputToken: BigNumberish,
    outputToken: BigNumberish,
    specifiedAmount: BigNumberish,
    metadata: string
): Interaction => {
    const interactionTypeAndAddress = packInteractionTypeAndAddress(
        InteractionCode.ComputeInputAmount,
        address
    );
    return {
        interactionTypeAndAddress,
        inputToken,
        outputToken,
        specifiedAmount,
        metadata
    };
}

const wrapEther = (amount: BigNumberish) : Interaction => {
    const interactionTypeAndAddress = packInteractionTypeAndAddress(
        InteractionCode.EtherWrap,
        AddressZero
    )
    return {
        interactionTypeAndAddress: interactionTypeAndAddress,
        inputToken: 0,
        outputToken: WRAPPED_ETHER_ID,
        specifiedAmount: amount,
        metadata: NullMetadata
    };
}

const unwrapEther = (amount: BigNumberish) : Interaction => {
    const interactionTypeAndAddress = packInteractionTypeAndAddress(
        InteractionCode.EtherUnwrap,
        AddressZero
    )
    return {
        interactionTypeAndAddress: interactionTypeAndAddress,
        inputToken: WRAPPED_ETHER_ID,
        outputToken: 0,
        specifiedAmount: amount,
        metadata: NullMetadata
    };
}

export {
    computeInputAmount,
    computeOutputAmount,
    unitUnwrapERC20,
    unitWrapERC20,
    unwrapERC1155,
    unwrapERC20,
    unwrapERC721,
    wrapERC1155,
    wrapERC20,
    wrapERC721,
    wrapEther,
    unwrapEther
}