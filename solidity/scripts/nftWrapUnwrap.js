const { ethers } = require("hardhat");
const hre = require("hardhat");
const {OceanABI} = require("./ABI/OceanABI");
const {ToucanABI} = require("./ABI/ToucanABI");
const shell = require("../utils");
const { getNfts } = require("./alchemy")

async function wrapNft (ocean, toucans, signer) {

    const userNfts = await getNfts(signer.address, toucans.address);
    const userToucans = userNfts.map((toucan) => parseInt(toucan.tokenId))

    if(userToucans.length > 0) {

        const toucanID = userToucans[0] // Get first Toucan that user owns
        const interaction = shell.interactions.wrapERC721({address: toucans.address, id: toucanID})

        await toucans.approve(ocean.address, toucanID)

        await shell.executeInteraction({ ocean, signer: signer, interaction })

    } else {
        console.error("No toucans to wrap")
    }

}

async function unwrapNft(ocean, toucans, signer) {

    const toucanMap = {} // Mapping of toucan IDs in Ocean to toucan IDs

    const oceanToucans = await getNfts(ocean.address, toucans.address)
    oceanToucans.forEach((toucan) => {
        const toucanOceanID = shell.utils.calculateWrappedTokenId({address: toucans.address, id: parseInt(toucan.tokenId)})
        toucanMap[toucanOceanID] = toucan.tokenId
    })

    const userOceanNfts = (await getNfts(signer.address, ocean.address)).filter((token) => token.balance == 1)
    const userWrappedToucans = []
    userOceanNfts.forEach((userOceanNft) => {
        const oceanID = ethers.BigNumber.from(userOceanNft.tokenId).toHexString()
        if(toucanMap[oceanID]) userWrappedToucans.push(parseInt(toucanMap[oceanID]))
    })

    if(userWrappedToucans.length > 0) {
        const toucanID = userWrappedToucans[0] // Get first wrapped Toucan that user owns 
        const interaction = shell.interactions.unwrapERC721({address: toucans.address, id: toucanID})

        await shell.executeInteraction({ ocean, signer: signer, interaction })
        
    } else {
        console.error("No toucans to unwrap")
    }
}

async function main() {

    const signer = await ethers.getSigner();

    console.log('Using', signer.address)
    console.log('User ETH balance', ethers.utils.formatEther(await ethers.provider.getBalance(signer.address)))

    const ocean = await hre.ethers.getContractAt(OceanABI, "0x8178f0844F08543A0Bd4956D892ef462BD7e71C4", signer)
    const toucans = await hre.ethers.getContractAt(ToucanABI, "0xF78A86958e15298E3454741C6060CF979283558B", signer);

    await wrapNft(ocean, toucans, signer)
    await unwrapNft(ocean, toucans, signer)
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
});