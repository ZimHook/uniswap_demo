import React, { useEffect, useState } from "react";
import { BrowserProvider, Contract, Eip1193Provider, ethers } from "ethers";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";
import {
  ROUTER_ADDRESS,
  TST_ADDRESS,
  USDC_ADDRESS,
  ERC20_ABI,
  ROUTER_ABI,
} from "../config";
import toast from "react-hot-toast";
import { sepolia } from "@reown/appkit/networks";

const mockTokens = {
  token1: {
    symbol: "TST",
    address: TST_ADDRESS,
    image: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    decimals: 18,
  },
  token2: {
    symbol: "USDC",
    address: USDC_ADDRESS,
    image: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
    decimals: 6,
  },
};

const Liquidity = () => {
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");
  const { walletProvider } = useAppKitProvider("eip155");
  const { isConnected } = useAppKitAccount();
  const { open } = useAppKit();

  const handleConfirm = async () => {
    if (!isConnected) {
      open();
      return;
    }
    const ethersProvider = new BrowserProvider(
      walletProvider as Eip1193Provider
    );
    const signer = await ethersProvider.getSigner();

    try {
      // 授权 token0
      const token0Contract = new Contract(
        mockTokens.token1.address,
        ERC20_ABI,
        signer
      );
      const tx0 = await token0Contract.approve(
        ROUTER_ADDRESS,
        BigInt(Number(amount0) * 10 ** mockTokens.token1.decimals)
      );
      const res0 = await tx0.wait();
      if (res0.status !== 1) {
        throw new Error("Token0 授权失败");
      }

      // 授权 token1
      const token1Contract = new Contract(
        mockTokens.token2.address,
        ERC20_ABI,
        signer
      );
      const tx1 = await token1Contract.approve(
        ROUTER_ADDRESS,
        BigInt(Number(amount1) * 10 ** mockTokens.token2.decimals)
      );
      const res1 = await tx1.wait();
      if (res1.status !== 1) {
        throw new Error("Token1 授权失败");
      }

      // 添加流动性
      const routerContract = new Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
      const addLiquidity_tx = await routerContract.addLiquidity(
        mockTokens.token1.address,
        mockTokens.token2.address,
        BigInt(Number(amount0) * 10 ** mockTokens.token1.decimals),
        BigInt(Number(amount1) * 10 ** mockTokens.token2.decimals),
        0,
        0
      );
      const addLiquidity_res = await addLiquidity_tx.wait();
      if (addLiquidity_res.status !== 1) {
        throw new Error("添加流动性失败");
      }
      toast.success("添加流动性成功");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "添加流动性失败");
    }
  };

  const fetchOptimal = async (
    amount: number,
    set: (v: string) => void,
    reversed: boolean
  ) => {
    const provider = new ethers.JsonRpcProvider(
      sepolia.rpcUrls.default.http[0]
    );
    const routerContract = new Contract(ROUTER_ADDRESS, ROUTER_ABI, provider);
    try {
      const poolInfo = await routerContract.pools(
        mockTokens.token1.address,
        mockTokens.token2.address
      );

      const optimal =
        Number(amount) *
        (reversed
          ? ((Number(poolInfo.token0Reserve) / Number(poolInfo.token1Reserve)) *
              10 ** mockTokens.token2.decimals) /
            10 ** mockTokens.token1.decimals
          : ((Number(poolInfo.token1Reserve) / Number(poolInfo.token0Reserve)) *
              10 ** mockTokens.token1.decimals) /
            10 ** mockTokens.token2.decimals);
      set(optimal.toString());
    } catch (error) {
      console.error(error);
    }
  };

  const debouncedFetchOptimal = React.useCallback(
    (() => {
      let timer: NodeJS.Timeout;
      return (amount: number, set: (v: string) => void, reversed: boolean) => {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          fetchOptimal(amount, set, reversed);
        }, 3000);
      };
    })(),
    []
  );

  useEffect(() => {
    const splited = amount0.split(".");
    if (splited[1]?.length > mockTokens.token1.decimals) {
      setAmount0(
        splited[0] + "." + splited[1].slice(0, mockTokens.token1.decimals)
      );
    }
  }, [amount0]);

  useEffect(() => {
    const splited = amount1.split(".");
    if (splited[1]?.length > mockTokens.token2.decimals) {
      setAmount1(
        splited[0] + "." + splited[1].slice(0, mockTokens.token2.decimals)
      );
    }
  }, [amount1]);

  return (
    <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="space-y-4">
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <img
                src={mockTokens.token1.image}
                alt="token"
                className="w-6 h-6 rounded-full"
              />
              <span className="text-white">{mockTokens.token1.symbol}</span>
            </div>
          </div>
          <input
            type="number"
            value={amount0}
            onChange={(e) => {
              debouncedFetchOptimal(Number(e.target.value), setAmount1, false);
              setAmount0(e.target.value);
            }}
            className="w-full bg-gray-700 text-white rounded-lg p-4 outline-none"
            placeholder="输入金额"
          />
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <img
                src={mockTokens.token2.image}
                alt="token"
                className="w-6 h-6 rounded-full"
              />
              <span className="text-white">{mockTokens.token2.symbol}</span>
            </div>
          </div>
          <input
            type="number"
            value={amount1}
            onChange={(e) => {
              debouncedFetchOptimal(Number(e.target.value), setAmount0, true);
              setAmount1(e.target.value);
            }}
            className="w-full bg-gray-700 text-white rounded-lg p-4 outline-none"
            placeholder="输入金额"
          />
        </div>

        <button
          onClick={handleConfirm}
          className="w-full bg-blue-600 text-white rounded-lg p-4 hover:bg-blue-700 transition-colors"
        >
          添加流动性
        </button>
      </div>
    </div>
  );
};

export default Liquidity;
