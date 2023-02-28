import { Alchemy, Network } from "alchemy-sdk";
import { ALCHEMY_KEY } from "../alchemyKey";

const config = {
  apiKey: ALCHEMY_KEY,
  network: Network.ARB_GOERLI,
};
const alchemy = new Alchemy(config);

export const getNfts = async (userAddress, contractAddress) => {
    const nfts = []
    let pageKey = ''
    do {
        const result = await alchemy.nft.getNftsForOwner(userAddress, {pageKey: pageKey});
        result.ownedNfts.forEach((nft) => {
            if(nft.contract.address == contractAddress.toLowerCase()) nfts.push(nft)
        })
        pageKey = result.pageKey ?? ''
    } while (pageKey)

    return nfts
};