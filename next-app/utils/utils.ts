import { keccak256 as solidityKeccak256 } from "@ethersproject/solidity";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { isAddress } from "@ethersproject/address";
import { hexConcat, hexDataSlice, isHexString } from "@ethersproject/bytes";
import { MaxUint256 } from "@ethersproject/constants"
import { ELEVEN_BYTES_OF_ZERO, WRAPPED_ETHER_ID } from "./constants";
import { Interaction, InteractionCode } from "./types"

const calculateWrappedTokenId = (address: string, id: BigNumberish): string => {
    return solidityKeccak256(["address", "uint256"], [address, id]);
}

const idsFromInteractions = (interactions: Interaction[]): BigNumber[] => {
    const interactionToIds = (interaction: Interaction) => {
        const interactionIds: BigNumberish[] = [];
        const { interactionType, address } = unpackInteractionTypeAndAddress(
            interaction.interactionTypeAndAddress
        );
        if (interactionType === InteractionCode.Erc20Wrap ||
            interactionType === InteractionCode.Erc20Unwrap) {
            interactionIds.push(calculateWrappedTokenId(address, 0));
        } else if (
            interactionType === InteractionCode.Erc721Wrap
            || interactionType === InteractionCode.Erc721Unwrap
            || interactionType === InteractionCode.Erc1155Wrap
            || interactionType === InteractionCode.Erc1155Unwrap
        ) {
            interactionIds.push(calculateWrappedTokenId(
                address,
                interaction.metadata
            )
            );
        } else if (
            interactionType === InteractionCode.ComputeInputAmount
            || interactionType == InteractionCode.ComputeOutputAmount
        ) {
            interactionIds.push(interaction.inputToken);
            interactionIds.push(interaction.outputToken);
        } else if(interactionType === InteractionCode.EtherWrap || interactionType === InteractionCode.EtherUnwrap){
            interactionIds.push(WRAPPED_ETHER_ID)
        } else {
            throw new Error("INVALID INTERACTION TYPE");
        }
        return interactionIds;
    }
    // for each interaction, determine the relevant unified ledger IDs
    const idsArrayNested = interactions.map((interaction) => interactionToIds(interaction));
    // flatten the nested arrays and take the set to find unique ids
    const idsSet = new Set(idsArrayNested.flat());
    // Set.values() returns an iterator, spread it into a list
    const idsList = [...idsSet.values()];
    // because of the 
    const ids = idsList.map((id) => BigNumber.from(id));
    return ids;
}

const wrapEtherFilter = (interactions : Interaction[]): [Interaction[], BigNumberish] => {
    for (var i = interactions.length - 1; i >= 0; i--) {
        const { interactionType, address } = unpackInteractionTypeAndAddress(
            interactions[i].interactionTypeAndAddress
        );
        if(interactionType === InteractionCode.EtherWrap){
            const etherAmount = interactions[i].specifiedAmount
            interactions.splice(i, 1)
            return [interactions, etherAmount]
        }
    }
    return [interactions, 0]
}

const packInteractionTypeAndAddress = (
    interaction: InteractionCode,
    address: string
): string => {
    console.assert(isAddress(address));
    return hexConcat([interaction, ELEVEN_BYTES_OF_ZERO, address]);
}

const numberWithFixedDecimals = (number: BigNumberish, decimals: BigNumberish): BigNumber => {
    const base = BigNumber.from("10");
    const mantissa = BigNumber.from(number);
    const exponent = BigNumber.from(decimals);
    return mantissa.mul(base.pow(exponent))
}

const unpackInteractionTypeAndAddress = (
    interactionTypeAndAddress: string
): { interactionType: string, address: string } => {
    console.assert(isHexString(interactionTypeAndAddress))
    const interactionType = hexDataSlice(interactionTypeAndAddress, 0, 1);
    const address = hexDataSlice(interactionTypeAndAddress, 12);
    console.assert(isAddress(address));
    return { interactionType, address };
}

const withDelta = (interaction: Interaction): Interaction => {
    return {
        ...interaction,
        specifiedAmount: MaxUint256
    }
}

export {
    calculateWrappedTokenId,
    idsFromInteractions,
    numberWithFixedDecimals,
    packInteractionTypeAndAddress,
    unpackInteractionTypeAndAddress,
    withDelta,
    wrapEtherFilter
}