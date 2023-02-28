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

async function fungibilizeNft (ocean, toucansAddress, fungibilizer, signer) {

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

    const fungibleTokenId = await fungibilizer.fungibleTokenId()

    const interactions = userWrappedToucans.map((wrappedToucanID) => 
        shell.interactions.computeOutputAmount({
            address: fungibilizer.address,
            inputToken: shell.utils.calculateWrappedTokenId({address: toucansAddress, id: wrappedToucanID}),
            outputToken: fungibleTokenId,
            specifiedAmount: 1,
            metadata: ethers.utils.hexZeroPad(wrappedToucanID, 32)
        })
    )

    await shell.executeInteractions({ ocean, signer: signer, interactions })

}

async function main() {

    const signer = await ethers.getSigner();

    console.log('Using', signer.address)
    console.log('User ETH balance', ethers.utils.formatEther(await ethers.provider.getBalance(signer.address)))

    const ocean = await hre.ethers.getContractAt(OceanABI, "0x8178f0844F08543A0Bd4956D892ef462BD7e71C4", signer)
    const toucansAddress = "0xF78A86958e15298E3454741C6060CF979283558B"

    const fungibilizer = await deploy(ocean.address, toucansAddress, signer)
    console.log("Fungibilizer address", fungibilizer.address)

    await fungibilizeNft(ocean, toucansAddress, fungibilizer, signer)
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
});