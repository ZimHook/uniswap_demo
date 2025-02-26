import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useState } from "react";
import { useEffect } from "react";
import { truncateString } from "./History";

interface Erc20Item {
  token_address: string;
  symbol: string;
  logo: string;
  decimals: number;
  balance_formatted: string;
}

const Balance = () => {
  const { address, isConnected } = useAppKitAccount();
  const [erc20List, setErc20List] = useState<Erc20Item[]>([]);

  const fetchErc20List = async () => {
    const list = await (
      await fetch(
        `https://deep-index.moralis.io/api/v2.2/wallets/${address}/tokens?chain=sepolia`,
        {
          headers: {
            "X-API-Key":
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImY3NTZlNDIzLTdmNmMtNGYyNi04MTEzLTk0OGQ3OGVkNmQ3NCIsIm9yZ0lkIjoiNDMzNzMyIiwidXNlcklkIjoiNDQ2MTY5IiwidHlwZUlkIjoiYWNmZjVhNzEtNjEyMi00YzBjLWIzZWMtYWViMjdiNTdlNTJiIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDA2MDI4MTMsImV4cCI6NDg5NjM2MjgxM30.XYgmczKGTz94mp4sTVRRM24dK-j5xEZXKzqjDQeD_bU",
          },
        }
      )
    ).json();
    setErc20List(list?.result ?? []);
  };

  useEffect(() => {
    if(isConnected) {
      fetchErc20List();
    }
  }, [address, isConnected]);

  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold">Balance</h1>
      <table className="w-[calc(100vw-48px)] text-white">
          <thead>
            <tr className="bg-gray-700">
              <th className="py-2 px-4 text-left">Token Symbol</th>
              <th className="py-2 px-4 text-left">Balance</th>
              <th className="py-2 px-4 text-left">CA</th>
            </tr>
          </thead>
          <tbody>
            {erc20List.map((event, index) => (
              <tr key={index} className="border-b border-gray-700">
                <td
                  className="py-2 px-4"
                >
                  {event.symbol}
                </td>
                <td
                  className="py-2 px-4"
                >
                  {event.balance_formatted}
                </td>
                <td
                  className="py-2 px-4 cursor-pointer"
                  onClick={() =>
                    window.open(
                      `https://sepolia.etherscan.io/address/${event.token_address}`,
                      "_blank"
                    )
                  }
                >
                  {truncateString(event.token_address)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
};

export default Balance;
