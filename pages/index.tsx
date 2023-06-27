import {
  ConnectWallet,
  useActiveClaimConditionForWallet,
  useAddress,
  useClaimConditions,
  useClaimedNFTSupply,
  useClaimerProofs,
  useClaimIneligibilityReasons,
  useContract,
  useContractMetadata,
  useNFT,
  useTotalCirculatingSupply,
  useUnclaimedNFTSupply,
  Web3Button,
} from "@thirdweb-dev/react";
import { BigNumber, utils } from "ethers";
import type { NextPage } from "next";
import { useCallback, useMemo, useState } from "react";
import styles from "./index.module.css";
import { parseIneligibility } from "../utils/parseIneligibility";

const Decreepies: NextPage = () => {
  const onTwitterContainerClick = useCallback(() => {
    window.open("https://twitter.com/DeCreepies");
  }, []);

  const onOpensea1IconClick = useCallback(() => {
    window.open("https://opensea.io/collection/decreepies");
  }, []);

  const onEtherscanClick = useCallback(() => {
    window.open(
      "https://etherscan.io/address/0xa0a6ed3fdc50ec1571963243ccea78f5371994e6"
    );
  }, []);

  const onMintlinkClick = useCallback(() => {
    const anchor = document.querySelector("[data-scroll-to='mintbutton']");
    if (anchor) {
      anchor.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, []);

  const onTwitterContainer1Click = useCallback(() => {
    window.open("https://twitter.com/DeCreepies");
  }, []);

  const onOpensea1Icon1Click = useCallback(() => {
    window.open("https://opensea.io/collection/decreepies");
  }, []);

  const onEtherscan1Click = useCallback(() => {
    window.open(
      "https://etherscan.io/address/0xa0a6ed3fdc50ec1571963243ccea78f5371994e6"
    );
  }, []);

  const contractAddress = "0xa0A6ed3Fdc50ec1571963243cCEa78f5371994e6";
  const { contract } = useContract(contractAddress);
  const address = useAddress();

  const [quantity, setQuantity] = useState(1);
  const claimConditions = useClaimConditions(contract);
  const activeClaimCondition = useActiveClaimConditionForWallet(
    contract,
    address
  );
  const claimerProofs = useClaimerProofs(contract, address || "");
  const claimIneligibilityReasons = useClaimIneligibilityReasons(contract, {
    quantity,
    walletAddress: address || "",
  });
  const unclaimedSupply = useUnclaimedNFTSupply(contract);
  const claimedSupply = useClaimedNFTSupply(contract);
  const { data: firstNft, isLoading: firstNftLoading } = useNFT(contract, 0);

  const numberClaimed = useMemo(() => {
    return BigNumber.from(claimedSupply.data || 0).toString();
  }, [claimedSupply]);

  const numberTotal = useMemo(() => {
    return BigNumber.from(claimedSupply.data || 0)
      .add(BigNumber.from(unclaimedSupply.data || 0))
      .toString();
  }, [claimedSupply.data, unclaimedSupply.data]);

  const priceToMint = useMemo(() => {
    const bnPrice = BigNumber.from(
      activeClaimCondition.data?.currencyMetadata.value || 0
    );
    return `${utils.formatUnits(
      bnPrice.mul(quantity).toString(),
      activeClaimCondition.data?.currencyMetadata.decimals || 18
    )} ${activeClaimCondition.data?.currencyMetadata.symbol}`;
  }, [
    activeClaimCondition.data?.currencyMetadata.decimals,
    activeClaimCondition.data?.currencyMetadata.symbol,
    activeClaimCondition.data?.currencyMetadata.value,
    quantity,
  ]);

  const maxClaimable = useMemo(() => {
    let bnMaxClaimable;
    try {
      bnMaxClaimable = BigNumber.from(
        activeClaimCondition.data?.maxClaimableSupply || 0
      );
    } catch (e) {
      bnMaxClaimable = BigNumber.from(1_000_000);
    }

    let perTransactionClaimable;
    try {
      perTransactionClaimable = BigNumber.from(
        activeClaimCondition.data?.maxClaimablePerWallet || 0
      );
    } catch (e) {
      perTransactionClaimable = BigNumber.from(1_000_000);
    }

    if (perTransactionClaimable.lte(bnMaxClaimable)) {
      bnMaxClaimable = perTransactionClaimable;
    }

    const snapshotClaimable = claimerProofs.data?.maxClaimable;

    if (snapshotClaimable) {
      if (snapshotClaimable === "0") {
        // allowed unlimited for the snapshot
        bnMaxClaimable = BigNumber.from(1_000_000);
      } else {
        try {
          bnMaxClaimable = BigNumber.from(snapshotClaimable);
        } catch (e) {
          // fall back to default case
        }
      }
    }

    const maxAvailable = BigNumber.from(unclaimedSupply.data || 0);

    let max;
    if (maxAvailable.lt(bnMaxClaimable)) {
      max = maxAvailable;
    } else {
      max = bnMaxClaimable;
    }

    if (max.gte(1_000_000)) {
      return 1_000_000;
    }
    return max.toNumber();
  }, [
    claimerProofs.data?.maxClaimable,
    unclaimedSupply.data,
    activeClaimCondition.data?.maxClaimableSupply,
    activeClaimCondition.data?.maxClaimablePerWallet,
  ]);

  const isSoldOut = useMemo(() => {
    try {
      return (
        (activeClaimCondition.isSuccess &&
          BigNumber.from(activeClaimCondition.data?.availableSupply || 0).lte(
            0
          )) ||
        numberClaimed === numberTotal
      );
    } catch (e) {
      return false;
    }
  }, [
    activeClaimCondition.data?.availableSupply,
    activeClaimCondition.isSuccess,
    numberClaimed,
    numberTotal,
  ]);

  const canClaim = useMemo(() => {
    return (
      activeClaimCondition.isSuccess &&
      claimIneligibilityReasons.isSuccess &&
      claimIneligibilityReasons.data?.length === 0 &&
      !isSoldOut
    );
  }, [
    activeClaimCondition.isSuccess,
    claimIneligibilityReasons.data?.length,
    claimIneligibilityReasons.isSuccess,
    isSoldOut,
  ]);

  const isLoading = useMemo(() => {
    return (
      activeClaimCondition.isLoading ||
      unclaimedSupply.isLoading ||
      claimedSupply.isLoading ||
      !contract
    );
  }, [
    activeClaimCondition.isLoading,
    contract,
    claimedSupply.isLoading,
    unclaimedSupply.isLoading,
  ]);

  const buttonLoading = useMemo(
    () => isLoading || claimIneligibilityReasons.isLoading,
    [claimIneligibilityReasons.isLoading, isLoading]
  );

  const buttonText = useMemo(() => {
    if (isSoldOut) {
      return "SOLD OUT";
    }

    if (canClaim) {
      const pricePerToken = BigNumber.from(
        activeClaimCondition.data?.currencyMetadata.value || 0
      );
      if (pricePerToken.eq(0)) {
        return "Mint (Free)";
      }
      return `Mint (${priceToMint})`;
    }
    if (claimIneligibilityReasons.data?.length) {
      return parseIneligibility(claimIneligibilityReasons.data, quantity);
    }
    if (buttonLoading) {
      return "Checking eligibility...";
    }

    return "Minting not available";
  }, [
    isSoldOut,
    canClaim,
    claimIneligibilityReasons.data,
    buttonLoading,
    activeClaimCondition.data?.currencyMetadata.value,
    priceToMint,
    quantity,
  ]);

  const dropNotReady = useMemo(
    () =>
      claimConditions.data?.length === 0 ||
      claimConditions.data?.every((cc) => cc.maxClaimableSupply === "0"),
    [claimConditions.data]
  );

  const dropStartingSoon = useMemo(
    () =>
      (claimConditions.data &&
        claimConditions.data.length > 0 &&
        activeClaimCondition.isError) ||
      (activeClaimCondition.data &&
        activeClaimCondition.data.startTime > new Date()),
    [
      activeClaimCondition.data,
      activeClaimCondition.isError,
      claimConditions.data,
    ]
  );

  if (!contractAddress) {
    return (
      <div className="flex h-full items-center justify-center">
        No contract address provided
      </div>
    );
  }

  return (
    <div className={styles.decreepies}>
      <div className={styles.navbar}>
        <img className={styles.line23} alt="" src="/line-2-3@2x.png" />
        <div className={styles.navbarcontent}>
          <div className={styles.logoandbutton}>
            <img
              className={styles.logomenu1Icon}
              alt=""
              src="/logomenu-1@2x.png"
            />
          </div>
          <div className={styles.linkandconnect}>
            <div className={styles.icon}>
              <div className={styles.twitter} onClick={onTwitterContainerClick}>
                <a className={styles.icon1} href="http://">
                  <img
                    className={styles.layer2Icon}
                    alt=""
                    src="/layer-2.svg"
                  />
                  <img className={styles.vectorIcon} alt="" src="/vector.svg" />
                </a>
              </div>
              <img
                className={styles.opensea1Icon}
                alt=""
                src="/opensea-1.svg"
                onClick={onOpensea1IconClick}
              />
              <a
                className={styles.etherscan}
                href="http://"
                target="_blank"
                onClick={onEtherscanClick}
              >
                <img className={styles.layer2Icon} alt="" src="/vector1.svg" />
                <img className={styles.vectorIcon2} alt="" src="/vector2.svg" />
                <img className={styles.vectorIcon3} alt="" src="/vector3.svg" />
              </a>
            </div>
            <ConnectWallet btnTitle="CONNECT" />
          </div>
        </div>
      </div>
      <div className={styles.mainContainer}>
        <div className={styles.whatIsTheDarkSideOfYourParent}>
          <div className={styles.whatIsThe}>
            What is the dark side of your mind?
          </div>
          <div className={styles.feelWhatIs}>
            Feel what is hidden deep inside you. Don't be afraid. Art will guide
            you. Awaken your inner being and let it break out.
          </div>
          <button className={styles.mintlink} onClick={onMintlinkClick}>
            <div className={styles.startMint}>start mint</div>
          </button>
        </div>
        <div className={styles.characters}>
          <img className={styles.row1Icon} alt="" src="/row-1@2x.png" />
          <div className={styles.stealthLaunchNo}>
            STEALTH LAUNCH. NO WHITELIST. REVEAL INSTANT. CREEPY VIBE
          </div>
        </div>
      </div>
      <img className={styles.line24} alt="" src="/line-2-4@2x.png" />
      <div className={styles.mintinfo}>
        <div className={styles.textmintinfo}>
          <div className={styles.mintInfo}>MINT INFO</div>
          <div className={styles.wenStealthLaunchContainer}>
            <p className={styles.wenStealthLaunch}>
              <span className={styles.wen}>Wen?</span>
              <span className={styles.span}>{` `}</span>
              <span>Stealth Launch</span>
            </p>
            <p className={styles.totalSupply3333}>
              <span>Total Supply?</span>
              <span className={styles.span1}> 3333</span>
            </p>

            <p className={styles.wenStealthLaunch}>
              <span className={styles.wen}>Reveal?</span>
              <span> Instant</span>
            </p>
            <p className={styles.wenStealthLaunch}>
              <span className={styles.wen}>Network?</span>
              <span> Ethereum</span>
            </p>
            <p className={styles.wenStealthLaunch}>
              <span className={styles.wen}>Price?</span>
              <span> First 500 free FCFS, then 0.0013 ETH</span>
            </p>
            <p className={styles.wenStealthLaunch}>
              <span className={styles.wen}>Max Wallet?</span>
              <span> 2 (free) / 20 (0.0013) per wallet</span>
            </p>
          </div>
        </div>
        <div className={styles.artpreview}>
          <div className={styles.parent}>
            <img className={styles.icon2} alt="" src="/2@2x.png" />
            <img className={styles.icon3} alt="" src="/3@2x.png" />
            <img className={styles.icon4} alt="" src="/10@2x.png" />
            <img className={styles.icon5} alt="" src="/12@2x.png" />
          </div>
          <div className={styles.group}>
            <img className={styles.icon2} alt="" src="/18@2x.png" />
            <img className={styles.icon3} alt="" src="/20@2x.png" />
            <img className={styles.icon4} alt="" src="/21@2x.png" />
            <img className={styles.icon5} alt="" src="/23@2x.png" />
          </div>
          <div className={styles.container}>
            <img className={styles.icon2} alt="" src="/13@2x.png" />
            <img className={styles.icon4} alt="" src="/15-1@2x.png" />
            <img className={styles.icon5} alt="" src="/16@2x.png" />
            <img className={styles.icon3} alt="" src="/24@2x.png" />
          </div>
        </div>
      </div>
      <img className={styles.line25} alt="" src="/line-2-4@2x.png" />
      <div className={styles.mint}>
        <div
          className={styles.unique11Decreepies}
        >{`3333 unique 1/1 DeCreepies NFTs. A unique and unimaginable combination of shapes and body parts of the characters will excite your imagination. DeCreepies are eager to break out on the gun. `}</div>
        <div className={styles.blockminted}>
          <div className={styles.artandtotal}>
            <img
              className={styles.mintart1Icon}
              alt=""
              src="/mintart-1@2x.png"
            />
            <div className={styles.totalMinted}>
              <div className={styles.totalMinted1}>Total Minted:</div>
              <div className={styles.div}>
                <p className={styles.wenStealthLaunch}>
                  {" "}
                  {numberClaimed}/{numberTotal}
                </p>
              </div>
            </div>
          </div>
          <div className={styles.mintsection}>
            <div className={styles.mintcontetndark}>
              <div className={styles.mintButton}>
                <div className={styles.number}>
                  <button
                    className={styles.minus}
                    onClick={() => setQuantity(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <div className={styles.div1}>-</div>
                  </button>
                  <div className={styles.div2}>{quantity}</div>
                  <button
                    className={styles.minus}
                    data-scroll-to="mintbutton"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= maxClaimable}
                  >
                    <div className={styles.div1}>+</div>
                  </button>
                </div>
                <Web3Button
                  className={styles.mint1}
                  contractAddress={contract?.getAddress() || ""}
                  action={(chtr) => chtr.erc721.claim(quantity)}
                  isDisabled={!canClaim || buttonLoading}
                >
                  {buttonLoading ? (
                    <div role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                  ) : (
                    buttonText
                  )}
                </Web3Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <img className={styles.line26} alt="" src="/line-2-6@2x.png" />
      <div className={styles.footer}>
        <div className={styles.footercontent}>
          <img
            className={styles.logomenu1Icon1}
            alt=""
            src="/logomenu-1@2x.png"
          />
          <div className={styles.icon14}>
            <div className={styles.icon}>
              <div
                className={styles.twitter}
                onClick={onTwitterContainer1Click}
              >
                <a className={styles.icon1} href="http://">
                  <img
                    className={styles.layer2Icon}
                    alt=""
                    src="/layer-2.svg"
                  />
                  <img className={styles.vectorIcon} alt="" src="/vector.svg" />
                </a>
              </div>
              <img
                className={styles.opensea1Icon}
                alt=""
                src="/opensea-1.svg"
                onClick={onOpensea1Icon1Click}
              />
              <a
                className={styles.etherscan}
                href="http://"
                target="_blank"
                onClick={onEtherscan1Click}
              >
                <img className={styles.layer2Icon} alt="" src="/vector1.svg" />
                <img className={styles.vectorIcon2} alt="" src="/vector2.svg" />
                <img className={styles.vectorIcon3} alt="" src="/vector3.svg" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Decreepies;
