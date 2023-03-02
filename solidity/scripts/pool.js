const { ethers } = require("hardhat");
const hre = require("hardhat");
const { OceanABI } = require("./ABI/OceanABI");
const { ERC20ABI } = require("./ABI/ERC20ABI");
const shell = require("../utils");

const ONE = ethers.utils.parseEther('1')
const ABDK_ONE = ethers.BigNumber.from(2).pow(64);

const deployProteus = async (signer, ocean, tokens, ms, _as, bs, ks, initialLPSupply) => {

    const init = []
    
    for(let i = 0; i < tokens.length; i++){
        if(!tokens[i].wrapped && tokens[i].address !== 'Ether'){
            const tokenContract = await hre.ethers.getContractAt(ERC20ABI, tokens[i].address);
            await tokenContract.connect(signer).approve(ocean.address, tokens[i].intialDeposit);
            init.push(shell.interactions.wrapERC20({address: tokens[i].address, amount: tokens[i].intialDeposit}));
        } else if(tokens[i].address == 'Ether'){
            // Wrap ETH into ocean
            await ocean.connect(signer).doMultipleInteractions([], [tokens[i].oceanID], {value: tokens[i].intialDeposit});
        }
    }

    console.log('Approved tokens')

    const proxyContract = await ethers.getContractFactory("LiquidityPoolProxy", signer);
    const proteusContract = await ethers.getContractFactory("Proteus", signer);

    const proxy = await proxyContract.deploy(
        tokens[0].oceanID,
        tokens[1].oceanID,
        ocean.address,
        initialLPSupply
    );
    await proxy.deployed();

    const proteus = await proteusContract.deploy(ms, _as, bs, ks);
    await proteus.deployed();

    await proxy.connect(signer).setImplementation(proteus.address)

    console.log('Deployed liquidity pool proxy and implementation')

    const lpTokenId = await proxy.lpTokenId();

    tokens.forEach((token) => {
        init.push(shell.interactions.computeOutputAmount({
            address: proxy.address,
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
    console.log('Pool contract address:', proxy.address)
    console.log('LP token ID:', lpTokenId.toHexString())

    for(let i = 0; i < tokens.length; i++) {
        const token = tokens[i]
        console.log(token.address, ethers.utils.formatUnits(await ocean.connect(signer).balanceOf(proxy.address, token.oceanID)))
    }

    console.log('LP Supply', ethers.utils.formatUnits(await ocean.connect(signer).balanceOf(signer.address, lpTokenId)))

    try {
        await hre.run("verify:verify", {
            address: proxy.address,
            constructorArguments: [
                tokens[0].oceanID,
                tokens[1].oceanID,
                ocean.address,
                initialLPSupply
            ]
        });
            
    } catch {}

    try {
        await hre.run("verify:verify", {
            address: proteus.address,
            constructorArguments: [
                ms,
                _as,
                bs,
                ks
            ]
        });
    } catch {}
}

const getParams = async (signer, proxyAddress) => {

    const proxy = await hre.ethers.getContractAt("LiquidityPoolProxy", proxyAddress)
    const proteusAddress = proxy.implementation();

    const pool = await hre.ethers.getContractAt("Proteus", proteusAddress)

    const ms = (await pool.connect(signer).getSlopes()).map((_m) => ethers.utils.formatUnits(_m.mul(ONE).div(ABDK_ONE)))
    const _as = (await pool.connect(signer).getAs()).map((_a) => ethers.utils.formatUnits(_a.mul(ONE).div(ABDK_ONE)))
    const bs = (await pool.connect(signer).getBs()).map((_b) => ethers.utils.formatUnits(_b.mul(ONE).div(ABDK_ONE)))
    const ks = (await pool.connect(signer).getKs()).map((_k) => ethers.utils.formatUnits(_k.mul(ONE).div(ABDK_ONE)))

    console.log("Params", ms, _as, bs, ks)

    console.log("Fee", await pool.BASE_FEE())

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
    const toucoinOceanId = '0x5c06caf016ce83ab20b6ddc4c6472be433f7995b36dfa6a8ef8595ebed4b9afd'

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

    // await deployPool(signer, ocean, tokens, initialLPSupply);

    /* EDIT POOL DEPLOY PARAMETERS BELOW */

    const {ms, _as, bs, ks} = require("./params/constant-product");

    await deployProteus(signer, ocean, tokens, ms, _as, bs, ks, initialLPSupply);

    // await getParams(signer, '')

    // await getBalances(signer, ocean, '')

}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
});