/* pages/index.js */
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";

import { nftaddress, nftmarketaddress, mdt1Address } from "../config";

import NFT from "../contracts/NFT.json";
import Market from "../contracts/NFTMarket.json";
import MDT1 from "../contracts/MashiroDemoToken1.json";

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [totalTradeVolume, setTotalTradeVolume] = useState(0);
  const [loadingState, setLoadingState] = useState("not-loaded");

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    /* create a generic provider and query for unsold market items */
    const provider = ethers.getDefaultProvider("ropsten", {
      infura: "a228bf98f09e471798dd65d4e1c00551",
    });
    // const provider = new ethers.providers.JsonRpcProvider();
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      provider
    );
    const data = await marketContract.fetchMarketItems();

    /**
     * Load logs & calculate trading volume
     */
    provider.resetEventsBlock(0);
    const events = await marketContract.queryFilter({
      fromBlock: 0,
      toBlock: "latest",
      topics: [
        ethers.utils.id(
          "MarketItemSold(uint256,address,uint256,address,address,uint256)"
        ),
      ],
    });
    let volume = 0;
    await Promise.all(
      events.map(async (event) => {
        volume += parseFloat(
          ethers.utils.formatUnits(event.args.price, "ether")
        );
      })
    );
    setTotalTradeVolume(volume);

    /*
     *  map over items returned from smart contract and format
     *  them as well as fetch their token metadata
     */
    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );
    setNfts(items);
    setLoadingState("loaded");
  }

  async function buyNft(nft) {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );
    const tokenContract = new ethers.Contract(mdt1Address, MDT1.abi, signer);
    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

    /**
     * As we are buying with custom MDT1 token,
     * 1st we have to ask for user approval to inform the Token Contract (MDT1 Contract)
     * that we will be sending a payment in MDT1 to the Market Contract
     */
    await tokenContract.approve(nftmarketaddress, price);

    const transaction =
      await marketContract.createMarketSaleWithCustomTokenAndSafeTransfer(
        nftaddress,
        nft.tokenId,
        price
      );
    await transaction.wait();
    loadNFTs();
  }

  const getMDT1 = async () => {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(mdt1Address, MDT1.abi, signer);

    /* call the getSome function which will send some MDT1 to the user's address */
    const transaction = await contract.getSome(
      ethers.utils.parseUnits("100000", "ether")
    );
    await transaction.wait();
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="w-full p-4 font-bold text-xl">
          Total trade volume: {totalTradeVolume} MDT1
        </div>
        <div className="p-4">
          <button
            type="button"
            className="bg-transparent hover:bg-pink-500 text-pink-700 font-semibold hover:text-white py-2 px-4 border border-pink-500 hover:border-transparent rounded"
            onClick={getMDT1}
          >
            Get some MDT1
          </button>
        </div>
      </div>
      {loadingState === "loaded" && !nfts.length ? (
        <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>
      ) : (
        <div className="flex justify-center">
          <div className="px-4" style={{ maxWidth: "1600px" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {nfts.map((nft, i) => (
                <div
                  key={i}
                  className="border shadow rounded-xl overflow-hidden"
                >
                  <img src={nft.image} />
                  <div className="p-4">
                    <p
                      style={{ height: "64px" }}
                      className="text-2xl font-semibold"
                    >
                      {nft.name}
                    </p>
                    <div style={{ height: "70px", overflow: "hidden" }}>
                      <p className="text-gray-400">{nft.description}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-black">
                    <p className="text-2xl mb-4 font-bold text-white">
                      {nft.price} MDT1
                    </p>
                    <button
                      className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                      onClick={() => buyNft(nft)}
                    >
                      Buy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
