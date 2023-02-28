import { BigNumberish } from "@ethersproject/bignumber";
import { Signer } from "@ethersproject/abstract-signer"
import { BaseContract, ContractTransaction } from "@ethersproject/contracts"

interface Interaction {
    interactionTypeAndAddress: string,
    inputToken: BigNumberish,
    outputToken: BigNumberish,
    specifiedAmount: BigNumberish,
    metadata: string
}

interface Ocean extends BaseContract {
    doMultipleInteractions: (interactions: Interaction[], ids: BigNumberish[]) => ContractTransaction,
    doInteraction: (interaction: Interaction) => ContractTransaction
}

enum InteractionCode {
    Erc20Wrap = "0x00",
    Erc20Unwrap = "0x01",
    Erc721Wrap = "0x02",
    Erc721Unwrap = "0x03",
    Erc1155Wrap = "0x04",
    Erc1155Unwrap = "0x05",
    ComputeInputAmount = "0x06",
    ComputeOutputAmount = "0x07",
    EtherUnwrap = "0x08",
    EtherWrap = "0xff"
}

export {
    BaseContract,
    ContractTransaction,
    BigNumberish,
    Interaction,
    InteractionCode,
    Signer,
    Ocean,
}
