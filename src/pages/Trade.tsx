import React, { useEffect, useState } from "react";
import {
  BrowserProvider,
  Contract,
  Eip1193Provider,
  JsonRpcProvider,
} from "ethers";
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

// 模拟数据，实际应从钱包/合约获取
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

const Trade = () => {
  const [inputAmount, setInputAmount] = useState("0");
  const [outputAmount, setOutputAmount] = useState("0");
  const [isReversed, setIsReversed] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<
    "able" | "unable" | "loading"
  >("unable");
  const [tokenBalance, setTokenBalance] = useState([0, 0]);
  const { walletProvider } = useAppKitProvider("eip155");
  const { isConnected } = useAppKitAccount();
  const [priceImpact, setPriceImpact] = useState(1);
  const { open } = useAppKit();

  const from = isReversed ? mockTokens.token2 : mockTokens.token1;
  const to = !isReversed ? mockTokens.token2 : mockTokens.token1;

  const handleSwap = () => {
    setIsReversed(!isReversed);
    const temp = inputAmount;
    setInputAmount(outputAmount);
    setOutputAmount(temp);
  };

  const handleConfirm = async () => {
    setConfirmStatus("loading");
    const ethersProvider = new BrowserProvider(
      walletProvider as Eip1193Provider
    );
    const signer = await ethersProvider.getSigner();
    // The Contract object
    const TokenContract = new Contract(from.address, ERC20_ABI, signer);

    try {
      const tx = await TokenContract.approve(
        ROUTER_ADDRESS,
        BigInt(Number(inputAmount) * 10 ** from.decimals)
      );
      const res = await tx.wait();
      if (res.status !== 1) {
        throw new Error("授权失败");
      }
      const routerContract = new Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
      const minAmountOut = BigInt(
        ((Number(outputAmount) * (100 - Number(priceImpact))) / 100) *
          10 ** to.decimals
      );
      const swap_tx = await routerContract.swap(
        from.address,
        to.address,
        BigInt(Number(inputAmount) * 10 ** from.decimals),
        minAmountOut
      );
      const swap_res = await swap_tx.wait();
      if (swap_res.status !== 1) {
        throw new Error("交易失败");
      }
      toast.success("Trade Success");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "交易失败");
    } finally {
      setConfirmStatus("unable");
      setInputAmount("0");
      setOutputAmount("0");
    }
  };

  const getEstimateAmount = async (
    inputAmount: string,
    from: { address: string; decimals: number },
    to: { address: string; decimals: number }
  ) => {
    if (!inputAmount || Number(inputAmount) <= 0) {
      setOutputAmount("0");
      setConfirmStatus("unable");
      return;
    }
    if (!isConnected) {
      open();
      return;
    }
    console.log(inputAmount, isReversed);
    try {
      setConfirmStatus("loading");
      const provider = new JsonRpcProvider(sepolia.rpcUrls.default.http[0]);
      const routerContract = new Contract(ROUTER_ADDRESS, ROUTER_ABI, provider);

      const poolInfo = await routerContract.pools(
        mockTokens.token1.address,
        mockTokens.token2.address
      );
      const amountOut = await routerContract.getAmountOut(
        BigInt(Number(inputAmount) * 10 ** from.decimals),
        isReversed ? poolInfo.token1Reserve : poolInfo.token0Reserve,
        isReversed ? poolInfo.token0Reserve : poolInfo.token1Reserve
      );

      setOutputAmount(String(Number(amountOut) / 10 ** to.decimals));
      setConfirmStatus("able");
    } catch (error) {
      console.error(error);
      setConfirmStatus("unable");
      toast.error("获取预估数量失败");
    }
  };

  const debouncedGetEstimateAmount = React.useCallback(
    (() => {
      let timer: NodeJS.Timeout;
      return (
        inputAmount: string,
        from: { address: string; decimals: number },
        to: { address: string; decimals: number }
      ) => {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          getEstimateAmount(inputAmount, from, to);
        }, 300);
      };
    })(),
    []
  );

  useEffect(() => {
    const splited = inputAmount.split(".");
    if (splited[1]?.length > from.decimals) {
      const fixed = splited[0] + "." + splited[1].slice(0, from.decimals);
      setInputAmount(fixed);
      debouncedGetEstimateAmount(fixed, from, to);
    } else {
      debouncedGetEstimateAmount(inputAmount, from, to);
    }
  }, [inputAmount, isReversed]);

  useEffect(() => {
    const splited = outputAmount.split(".");
    if (splited[1]?.length > to.decimals) {
      setOutputAmount(splited[0] + "." + splited[1].slice(0, to.decimals));
    }
  }, [outputAmount, isReversed]);

  const fetchBalances = async () => {
    try {
      const ethersProvider = new BrowserProvider(
        walletProvider as Eip1193Provider
      );
      const signer = await ethersProvider.getSigner();
      const token1Contract = new Contract(
        mockTokens.token1.address,
        ERC20_ABI,
        signer
      );
      const token2Contract = new Contract(
        mockTokens.token2.address,
        ERC20_ABI,
        signer
      );

      const token1Balance = await token1Contract.balanceOf(signer.getAddress());
      const token2Balance = await token2Contract.balanceOf(signer.getAddress());

      setTokenBalance([
        Number(token1Balance) / 10 ** mockTokens.token1.decimals,
        Number(token2Balance) / 10 ** mockTokens.token2.decimals,
      ]);
    } catch (error) {
      console.error("获取余额失败", error);
    }
  };

  useEffect(() => {
    if (!isConnected) {
      setTokenBalance([0, 0]);
      return;
    }
    fetchBalances();
    const intervalId = setInterval(fetchBalances, 5000);
    return () => clearInterval(intervalId);
  }, [isConnected]);

  return (
    <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="space-y-4">
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <img
                src={
                  isReversed ? mockTokens.token2.image : mockTokens.token1.image
                }
                alt="token"
                className="w-6 h-6 rounded-full"
              />
              <span className="text-white">
                {isReversed
                  ? mockTokens.token2.symbol
                  : mockTokens.token1.symbol}
              </span>
            </div>
            <span className="text-gray-400 text-sm">
              余额: {isReversed ? tokenBalance[1] : tokenBalance[0]}
            </span>
          </div>
          <input
            type="number"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg p-4 outline-none"
            placeholder="输入金额"
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSwap}
            className="bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <img
                src={
                  isReversed ? mockTokens.token1.image : mockTokens.token2.image
                }
                alt="token"
                className="w-6 h-6 rounded-full"
              />
              <span className="text-white">
                {isReversed
                  ? mockTokens.token1.symbol
                  : mockTokens.token2.symbol}
              </span>
            </div>
            <span className="text-gray-400 text-sm">
              余额: {isReversed ? tokenBalance[0] : tokenBalance[1]}
            </span>
          </div>
          <input
            type="number"
            value={outputAmount}
            // onChange={(e) => setOutputAmount(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg p-4 outline-none"
            disabled={true}
            placeholder="输出金额"
          />
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white">滑点</span>
            <span className="text-gray-400 text-sm">{priceImpact}%</span>
          </div>
          <input
            type="number"
            value={priceImpact}
            onChange={(e) => {
              let value = e.target.value;
              const splited = value.split(".");
              if (splited[1]?.length > 2) {
                value = splited[0] + "." + splited[1].slice(0, 2);
              }
              if (Number(value) > 100) {
                value = "100";
              }
              setPriceImpact(Number(value));
            }}
            className="w-full bg-gray-700 text-white rounded-lg p-4 outline-none"
            placeholder="输入滑点百分比"
            min={0}
            max={100}
            step="0.1"
          />
        </div>
        <button
          onClick={handleConfirm}
          className={`w-full bg-blue-600 text-white rounded-lg p-4 hover:bg-blue-700 transition-colors`}
          disabled={confirmStatus === "loading" || confirmStatus === "unable"}
        >
          {confirmStatus === "loading"
            ? "确认中..."
            : confirmStatus === "unable"
            ? "无法兑换"
            : "确认兑换"}
        </button>
      </div>
    </div>
  );
};

export default Trade;
