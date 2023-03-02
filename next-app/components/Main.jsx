import React, { useState, useEffect } from "react";
import { useAccount, useProvider, useSigner, useContract, erc20ABI } from "wagmi";
import { IpfsImage } from "react-ipfs-image";
import DisplayMessage from "./utils/DisplayMessage";
import LoadingScreen from "./utils/LoadingScreen";
import * as utils from "../alchemy.js";
import { useIsMounted } from "./hooks/useIsMounted";
import { Grid, GridItem, Button } from "@chakra-ui/react";
import { ethers } from "ethers";
import * as shell from "../utils";
import toast, { Toaster } from "react-hot-toast";
import { getNfts } from "../alchemy";
import { OceanABI } from "../ABIs/OceanABI";
import { ToucanABI } from "../ABIs/ToucanABI";
import { FungibilizerABI } from "../ABIs/Fungibilizer";

export default function Main() {
  // contracts
  const TOUCANS_ADDRESS = "0xF78A86958e15298E3454741C6060CF979283558B";
  const OCEAN_ADDRESS = "0x8178f0844F08543A0Bd4956D892ef462BD7e71C4";
  const USDC_ADDRESS = '0x1f84761D120F2b47E74d201aa7b90B73cCC3312c'
  const FUNGIBILIZER_ADDRESS = "0xb38e064CCc88a6A5DAC2DD3D4220bce2c22a53F9";
  const POOL_ADDRESS = '0x3884fe8eeE4C03df0D211A2B9DA18d11687924e3'

  // hooks
  const isMounted = useIsMounted();
  const provider = useProvider();
  const { data: signer } = useSigner();
  const { address, isConnected, isConnecting, isDisconnected, isReconnecting } =
    useAccount();

  const ocean = useContract({
    address: OCEAN_ADDRESS,
    abi: OceanABI,
    signerOrProvider: signer || provider,
  });

  const toucans = useContract({
    address: TOUCANS_ADDRESS,
    abi: ToucanABI,
    signerOrProvider: signer || provider,
  });

  const fungibilizer = useContract({
    address: FUNGIBILIZER_ADDRESS,
    abi: FungibilizerABI,
    signerOrProvider: signer || provider,
  });

  const usdc = useContract({
    address: USDC_ADDRESS,
    abi: erc20ABI,
    signerOrProvider: signer || provider
  })

  // state
  const [userToucans, setUserToucans] = useState([]);
  const [userWrappedToucans, setUserWrappedToucans] = useState([]);
  const [fungibilizerToucans, setFungibilizerToucans] = useState([]);
  const [userBalances, setUserBalances] = useState({});

  // handlers
  const handleWrapNft = async (wrap, toucanID) => {

    let interaction

    if(wrap){
      if(!(await toucans.isApprovedForAll(address, OCEAN_ADDRESS))) await toucans.setApprovalForAll(OCEAN_ADDRESS, true)
      interaction = shell.interactions.wrapERC721(TOUCANS_ADDRESS, toucanID)
    } else {
      interaction = shell.interactions.unwrapERC721(TOUCANS_ADDRESS, toucanID)            
    }

    shell.executeInteraction(ocean, signer, interaction).then((response) => {
        const toastText = wrap ? 'Wrap' : 'Unwrap'
        toast.promise(response.wait(), {
            loading: toastText + 'ping NFT',
            success: () => {
                fetchWrappedNFTs();
                fetchNFTs();
                return toastText + " success!"
            },
            error: () => {
                fetchWrappedNFTs();
                fetchNFTs();
                return toastText + " failed!"
            }
        })
    }).catch((error) => console.error(error))

  };

  const handleFungibilizer = async (fung, toucanID = null) => {
    
    let interaction

    const fungibleTokenId = await fungibilizer.fungibleTokenId();
    if(fung){        
        interaction = shell.interactions.computeOutputAmount(
            FUNGIBILIZER_ADDRESS, 
            shell.utils.calculateWrappedTokenId(TOUCANS_ADDRESS, toucanID),
            fungibleTokenId,
            1,
            ethers.utils.hexZeroPad(toucanID, 32)
        )
    } else {
        if (parseInt(userBalances['Toucoin']) > 0) {
            toucanID = fungibilizerToucans[0];
            interaction = shell.interactions.computeOutputAmount(
                FUNGIBILIZER_ADDRESS,
                fungibleTokenId,
                shell.utils.calculateWrappedTokenId(TOUCANS_ADDRESS, toucanID),
                await fungibilizer.exchangeRate(), // Trade 1 toucan's worth
                ethers.utils.hexZeroPad(toucanID, 32)
            )
        } else {
            console.error("No toucoin to unfungibilize");
        }
    }        

    shell.executeInteraction(ocean, signer, interaction).then((response) => {
        const toastText = fung ? 'Fungibiliz' : 'Unfungibiliz'
        toast.promise(response.wait(), {
            loading: toastText + 'ing NFT',
            success: () => {
                fetchWrappedNFTs();
                fetchTokenBalances();
                return toastText + "e success!"
            },
            error: () => {
                fetchWrappedNFTs();
                fetchTokenBalances();
                return toastText + "e failed!"
            }
        })
    }).catch((error) => console.error(error))

  };

  const handleSwap = async (forward) => {
    
    let interactions

    const fungibleTokenId = await fungibilizer.fungibleTokenId();
    const toucoinRate = await fungibilizer.exchangeRate() // Amount of toucoin per toucan

    if(forward){
        if (parseInt(userBalances['Toucoin']) > 0) {
            interactions = [
                shell.interactions.computeOutputAmount(
                    POOL_ADDRESS,
                    fungibleTokenId,
                    shell.utils.calculateWrappedTokenId(USDC_ADDRESS, 0),
                    toucoinRate, 
                    shell.constants.THIRTY_TWO_BYTES_OF_ZERO
                ),
                shell.interactions.unwrapERC20(
                    USDC_ADDRESS,
                    ethers.constants.MaxUint256
                )
            ]
        } else {
            console.error("No toucoin to swap");
        }
    } else {

      if((await usdc.allowance(address, OCEAN_ADDRESS)) == 0){
        await usdc.approve(OCEAN_ADDRESS, ethers.constants.MaxUint256);
      }
      interactions = [
        shell.interactions.computeInputAmount(
            POOL_ADDRESS,
            shell.utils.calculateWrappedTokenId(USDC_ADDRESS, 0),
            fungibleTokenId,
            toucoinRate,
            shell.constants.THIRTY_TWO_BYTES_OF_ZERO
        ),
        shell.interactions.wrapERC20(
            USDC_ADDRESS,
            ethers.constants.MaxUint256
        )
      ]
    }

    shell.executeInteractions(ocean, signer, interactions).then((response) => {
        const toastText = forward ? 'Toucoin' : 'USDC'
        toast.promise(response.wait(), {
            loading: 'Swapping ' + toastText,
            success: () => {
                fetchWrappedNFTs();
                fetchTokenBalances();
                return "Swap success!"
            },
            error: () => {
                fetchWrappedNFTs();
                fetchTokenBalances();
                return "Swap failed!"
            }
        })
    }).catch((error) => console.error(error))

  };

  const handleToucanToUSDC = async (toucanID) => {

    if(!(await toucans.isApprovedForAll(address, OCEAN_ADDRESS))) await toucans.setApprovalForAll(OCEAN_ADDRESS, true)
    
    const fungibleTokenId = await fungibilizer.fungibleTokenId();
    const toucoinRate = await fungibilizer.exchangeRate(); // Amount of toucoin per toucan

    const interactions = [
      shell.interactions.wrapERC721(
          TOUCANS_ADDRESS,
          toucanID
      ),
      shell.interactions.computeOutputAmount(
        FUNGIBILIZER_ADDRESS,
        shell.utils.calculateWrappedTokenId(TOUCANS_ADDRESS, toucanID),
        fungibleTokenId,
        1,
        ethers.utils.hexZeroPad(toucanID, 32)
      ),
      shell.interactions.computeOutputAmount(
          POOL_ADDRESS,
          fungibleTokenId,
          shell.utils.calculateWrappedTokenId(USDC_ADDRESS, 0),
          toucoinRate,
          shell.constants.THIRTY_TWO_BYTES_OF_ZERO
      ),
      shell.interactions.unwrapERC20(
        USDC_ADDRESS,
        ethers.constants.MaxUint256
      )
    ]

    const toastText = "Trade ";
    shell.executeInteractions(ocean, signer, interactions).then((response) => {
        toast.promise(response.wait(), {
          loading: toastText + " pending",
          success: () => {
            fetchWrappedNFTs();
            fetchNFTs();
            fetchTokenBalances();
            return toastText + " success!";
          },
          error: () => {
            fetchWrappedNFTs();
            fetchNFTs();
            fetchTokenBalances();
            return toastText + " failed!";
          },
        });
      })
      .catch((error) => console.error(error));
  };

  const fetchNFTs = async () => {
    setUserToucans((await utils.getNfts(address, TOUCANS_ADDRESS)).map((toucan) => parseInt(toucan.tokenId)));
  };

  const fetchWrappedNFTs = async () => {

    const toucanMap = {};

    const oceanToucans = await utils.getNfts( OCEAN_ADDRESS, TOUCANS_ADDRESS);
    oceanToucans.forEach((toucan) => {
      const toucanOceanID = shell.utils.calculateWrappedTokenId(
        TOUCANS_ADDRESS,
        parseInt(toucan.tokenId)
      );
      toucanMap[toucanOceanID] = toucan.tokenId;
    });

    const userOceanNfts = (await getNfts(address, OCEAN_ADDRESS)).filter(
      (token) => token.balance == 1
    );

    const fungibilizerOceanNfts = (
        await utils.getNfts(FUNGIBILIZER_ADDRESS, OCEAN_ADDRESS)
    ).filter((token) => token.balance == 1);

    setUserWrappedToucans(
        userOceanNfts.map((userOceanNft) => 
            ethers.BigNumber.from(userOceanNft.tokenId).toHexString()
        ).map((oceanID) => parseInt(toucanMap[oceanID])).filter(Boolean)
    )

    setFungibilizerToucans(
        fungibilizerOceanNfts.map((fungibilizerOceanNft) => 
            ethers.BigNumber.from(fungibilizerOceanNft.tokenId).toHexString()
        ).map((oceanID) => parseInt(toucanMap[oceanID])).filter(Boolean)
    )
  };

  const fetchTokenBalances = async () => {

    const toucoinBalance = await ocean.balanceOf(address, await fungibilizer.fungibleTokenId())
    const usdcBalance = await usdc.balanceOf(address)

    const newUserBalances = {
        'Toucoin': ethers.utils.formatUnits(toucoinBalance),
        'USDC': ethers.utils.formatUnits(usdcBalance)
    }
    setUserBalances(newUserBalances)

  }

  useEffect(() => {
    if (isConnected) {
      fetchNFTs();
      fetchWrappedNFTs();
      fetchTokenBalances();
    }
  }, [isConnected, address]);

  if (!isConnected && isMounted && isDisconnected) {
    return <DisplayMessage message="Please connect your wallet." />;
  }

  if (!isMounted || !provider || !signer || isConnecting || isReconnecting) {
    return <LoadingScreen />;
  }

  return (
    <div style={{ padding: 10 }}>
      <Toaster />
      {isConnected && (
        <>
          <DisplayMessage message={"Your NFTs:"} />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Grid templateColumns="repeat(4, 1fr)" gap={2} padding={3}>
              {userToucans &&
                userToucans.map((toucanID) => (
                  <GridItem key={toucanID}>
                    <IpfsImage
                      key={toucanID}
                      hash={
                        "ipfs://QmNzwGJJEFNsck7havfqX7MjVRtiWpuAA7MWwc9kD8XHys/" +
                        toucanID +
                        ".jpg"
                      }
                      width="150px"
                      height="150px"
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "10px",
                      }}
                    >
                      <Button
                        style={{
                          marginBottom: "10px",
                          backgroundColor: "#FFC107",
                        }}
                        onClick={() => handleWrapNft(true, toucanID)}
                      >
                        Wrap NFT
                      </Button>
                      <Button onClick={() => handleToucanToUSDC(toucanID)}>
                        NFT to USDC
                      </Button>
                    </div>
                  </GridItem>
                ))}
            </Grid>
          </div>
          <DisplayMessage message={"Your Wrapped NFTs:"} />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Grid templateColumns="repeat(4, 1fr)" gap={2} padding={3}>
              {userWrappedToucans &&
                userWrappedToucans.map((toucanID) => (
                  <GridItem key={toucanID}>
                    <IpfsImage
                      key={toucanID}
                      hash={
                        "ipfs://QmNzwGJJEFNsck7havfqX7MjVRtiWpuAA7MWwc9kD8XHys/" +
                        toucanID +
                        ".jpg"
                      }
                      width="150px"
                      height="150px"
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "10px",
                      }}
                    >
                      <Button 
                        style={{
                            marginBottom: "10px",
                            backgroundColor: "#FFC107",
                        }}
                        onClick={() => handleWrapNft(false, toucanID)}
                      >
                        Unwrap NFT
                      </Button>
                      <Button onClick={() => handleFungibilizer(true, toucanID)}>
                        Fungibilize
                      </Button>
                    </div>
                  </GridItem>
                ))}
            </Grid>
          </div>
          <DisplayMessage
            message={`Your Toucoin Balance: ${userBalances["Toucoin"] ?? 0}`}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              marginTop: "36px",
            }}
          >
            <Button onClick={() => handleFungibilizer(false)}>Unfungibilize</Button>
            <Button onClick={() => handleSwap(true)}>Swap Toucoin</Button>
          </div>
          <DisplayMessage
            message={`Your USDC Balance: ${userBalances["USDC"] ?? 0}`}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              marginTop: "36px",
            }}
          >
            <Button onClick={() => handleSwap(false)}>Swap USDC</Button>
          </div>
        </>
      )}
    </div>
  );
}