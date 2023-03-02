const { ethers } = require("hardhat");
const hre = require("hardhat");
const { OceanABI } = require("./ABI/OceanABI");
const shell = require("../utils");
const { getNfts } = require("./alchemy")

async function deploy (oceanAddress, toucansAddress, signer) {

    const fungibilizerContract = await hre.ethers.getContractFactory("Fungibilizer", signer)
    const fungibilizer = await fungibilizerContract.deploy(oceanAddress, toucansAddress, ethers.utils.parseUnits('100'))

    return fungibilizer
}

async function nftToFungible (ocean, toucansAddress, fungibilizer, signer) {

    const toucanMap = {} // Mapping of toucan IDs in Ocean to toucan IDs

    const oceanToucans = await getNfts(ocean.address, toucansAddress)
    oceanToucans.forEach((toucan) => {
        const toucanOceanID = shell.utils.calculateWrappedTokenId({address: toucansAddress, id: parseInt(toucan.tokenId)})
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

        const interaction = shell.interactions.computeOutputAmount({
            address: fungibilizer.address,
            inputToken: shell.utils.calculateWrappedTokenId({address: toucansAddress, id: toucanID}),
            outputToken: await fungibilizer.fungibleTokenId(),
            specifiedAmount: 1,
            metadata: ethers.utils.hexZeroPad(toucanID, 32)

        })

        await shell.executeInteraction({ ocean, signer: signer, interaction })
        
    } else {
        console.error("No toucans to fungibilize")
    }

}

async function fungibleToNft (ocean, toucansAddress, fungibilizer, signer) {

    const toucanMap = {} // Mapping of toucan IDs in Ocean to toucan IDs

    const oceanToucans = await getNfts(ocean.address, toucansAddress)
    oceanToucans.forEach((toucan) => {
        const toucanOceanID = shell.utils.calculateWrappedTokenId({address: toucansAddress, id: parseInt(toucan.tokenId)})
        toucanMap[toucanOceanID] = toucan.tokenId
    })

    const fungibilizerNfts = (await getNfts(fungibilizer.address, ocean.address)).filter((token) => token.balance == 1)
    const fungibilizerToucans = []
    fungibilizerNfts.forEach((fungibilizerNft) => {
        const oceanID = ethers.BigNumber.from(fungibilizerNft.tokenId).toHexString()
        if(toucanMap[oceanID]) fungibilizerToucans.push(parseInt(toucanMap[oceanID]))
    })

    if(fungibilizerToucans.length > 0) {
        const toucanID = fungibilizerToucans[0] // Get first Toucan in Ocean that Fungibilizer has

        const interaction = shell.interactions.computeOutputAmount({
            address: fungibilizer.address,
            inputToken: await fungibilizer.fungibleTokenId(),
            outputToken: shell.utils.calculateWrappedTokenId({address: toucansAddress, id: toucanID}),
            specifiedAmount: await fungibilizer.exchangeRate(),
            metadata: ethers.utils.hexZeroPad(toucanID, 32)

        })

        await shell.executeInteraction({ ocean, signer: signer, interaction })
        
    } else {
        console.error("No toucans to redeem")
    }
}

async function main() {

    const signer = await ethers.getSigner();

    console.log('Using', signer.address)
    console.log('User ETH balance', ethers.utils.formatEther(await ethers.provider.getBalance(signer.address)))

    const ocean = await hre.ethers.getContractAt(OceanABI, "0x8178f0844F08543A0Bd4956D892ef462BD7e71C4", signer)
    const toucansAddress = "0xF78A86958e15298E3454741C6060CF979283558B"

    const fungibilizer = await deploy(ocean.address, toucansAddress, signer)

    // const fungibilizer = await hre.ethers.getContractAt("Fungibilizer", "", signer)

    // await nftToFungible(ocean, toucansAddress, fungibilizer, signer)
    // await fungibleToNft(ocean, toucansAddress, fungibilizer, signer)
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
});