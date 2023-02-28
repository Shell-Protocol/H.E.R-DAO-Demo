const { ethers } = require("hardhat");
const hre = require("hardhat");
const { OceanABI } = require("./ABI/OceanABI");
const shell = require("../utils");
const { ERC20ABI } = require("./ABI/ERC20ABI");
const { FungibilizerABI } = require("../../next-app/ABIs/Fungibilizer");

const deployPool = async (signer, ocean, tokens, initialLPSupply) => {

    const init = []
    
    for(let i = 0; i < tokens.length; i++){
        if(!tokens[i].wrapped && tokens[i].address !== 'Ether'){
            const tokenContract = await hre.ethers.getContractAt(ERC20ABI, tokens[i].address);
            await tokenContract.connect(signer).approve(ocean.address, tokens[i].intialDeposit);
            init.push(shell.interactions.wrapERC20({address: tokens[i].address, amount: tokens[i].intialDeposit}));
        }
    }

    console.log('Approved tokens')

    const poolContract = await ethers.getContractFactory("ConstantProduct", signer)
    const pool = await poolContract.deploy(
        tokens[0].oceanID,
        tokens[1].oceanID,
        ocean.address,
        initialLPSupply
    )
    await pool.deployed();

    const lpTokenId = await pool.lpTokenId();

    tokens.forEach((token) => {
        init.push(shell.interactions.computeOutputAmount({
            address: pool.address,
            inputToken: token.oceanID,
            outputToken: lpTokenId,
            specifiedAmount: token.intialDeposit,
            metadata: shell.constants.THIRTY_TWO_BYTES_OF_ZERO
        }));
    });

    await shell.executeInteractions({
        ocean,
        signer,
        interactions: init
    });

    console.log('Seeded pool with initial liquidity')
    console.log('Pool contract address:', pool.address)
    console.log('LP token ID:', lpTokenId.toHexString())

}

const getBalances = async (signer, ocean, poolAddress) => {

    const pool = await hre.ethers.getContractAt("ConstantProduct", poolAddress)
    const xToken = await pool.connect(signer).xToken();
    const yToken = await pool.connect(signer).yToken();
    const lpToken = await pool.connect(signer).lpTokenId();
    const totalSupply = await pool.connect(signer).getTokenSupply(lpToken);
    const balances = await ocean.connect(signer).balanceOfBatch([poolAddress, poolAddress], [xToken, yToken])
    
    console.log('Pool balances', balances.map((balance) => ethers.utils.formatUnits(balance)))
    console.log('Total supply', ethers.utils.formatUnits(totalSupply))

}

async function main() {
    const signer = await ethers.getSigner();

    console.log('Using', signer.address)
    console.log('User ETH balance', ethers.utils.formatEther(await ethers.provider.getBalance(signer.address)))

    const ocean = await hre.ethers.getContractAt(OceanABI, "0x8178f0844F08543A0Bd4956D892ef462BD7e71C4")   
    const usdcAddress = '0x1f84761D120F2b47E74d201aa7b90B73cCC3312c';

    const fungibilizer = await hre.ethers.getContractAt(FungibilizerABI, "0x8A5d6D0644e8dD73F93900072eC9D85155B22195") 
    const toucoinOceanId = await fungibilizer.fungibleTokenId();

    const tokens = [
        {
            address: 'Toucoin',
            oceanID: toucoinOceanId,
            wrapped: true,
            intialDeposit: hre.ethers.utils.parseEther('1000')
        },
        {
            address: usdcAddress,
            oceanID: shell.utils.calculateWrappedTokenId({address: usdcAddress, id: 0}),
            wrapped: false,
            intialDeposit: hre.ethers.utils.parseEther('1000')
        } 
    ]

    const initialLPSupply = hre.ethers.utils.parseEther('2000');

    for(let i = 0; i < tokens.length; i++) {
        const token = tokens[i]
        if(token.wrapped){
            console.log(token.address, ethers.utils.formatUnits(await ocean.connect(signer).balanceOf(signer.address, token.oceanID)))
        } else if(token.address !== 'Ether'){
            const tokenContract = await hre.ethers.getContractAt(ERC20ABI, token.address);
            console.log(token.address, await tokenContract.connect(signer).balanceOf(signer.address))
        }
       
    }

    await deployPool(signer, ocean, tokens, initialLPSupply);

    // await getBalances(signer, ocean, '')

}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
});