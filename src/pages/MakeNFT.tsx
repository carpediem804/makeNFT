import React, { useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { CONTRACT_ADDRESS ,ABI as abi } from "./config";


const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

interface FormInput {
  name: string;
  description: string;
}

function MakeNFT() {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [formInput, updateFormInput] = useState<FormInput>({
    name: "",
    description: "",
  });

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function createNFT() {
    const { name, description } = formInput;
    if (!name || !description || !fileUrl) return;
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      /* after file is uploaded to IPFS, pass the URL to the smart contract to create the NFT */
      const provider = new ethers.providers.JsonRpcProvider(
        "https://rpc-mumbai.maticvigil.com"
      );
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      const tx = await contract.mint(url);
      await tx.wait();
      alert("NFT created!");
    } catch (error) {
      console.log("Error creating NFT: ", error);
    }
  }

  return (
    <div>
      <form onSubmit={createNFT}>
        <input
          placeholder="Asset Name"
          onChange={(e) =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
        />
        <input
          placeholder="Asset Description"
          onChange={(e) =>
            updateFormInput({ ...formInput, description: e.target.value })
          }
        />
        <input type="file" onChange={onChange} />
        <button type="submit">Create NFT</button>
      </form>
    </div>
  );
}

export default MakeNFT;
