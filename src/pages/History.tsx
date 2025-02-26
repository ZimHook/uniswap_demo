import { useEffect, useState } from "react";
import { Log } from "ethers";
import { useAppKitAccount } from "@reown/appkit/react";

interface Transaction {
  blockHash: string;
  blockNumber: string;
  contractAddress: string;
  from: string;
  functionName: string;
  hash: string;
  input: string;
  isError: string;
  methodId: string;
  timeStamp: string;
  to: string;
  value: string;
}

const truncateString = (
  str: string,
  start: number = 6,
  end: number = 4
): string => {
  if (!str) return "";
  if (str.length <= start + end) return str;
  return `${str.slice(0, start)}...${str.slice(-end)}`;
};

const History = () => {
  const [events, setEvents] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const { address, isConnected } = useAppKitAccount();

  const getEvents = async () => {
    const history = await (
      await fetch(
        `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=20&sort=desc&apikey=CHK82YDBUNI8PUK86RKQXM3JW3S4UWGPF4`
      )
    ).json();

    setEvents(history.result);
  };

  useEffect(() => {
    if (isConnected) {
      getEvents();
    }
  }, [address, isConnected, page]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">交易历史</h2>
      <div className="space-y-4">
        <table className="w-[calc(100vw-48px)] text-white">
          <thead>
            <tr className="bg-gray-700">
              <th className="py-2 px-4 text-left">区块哈希</th>
              <th className="py-2 px-4 text-left">块高</th>
              <th className="py-2 px-4 text-left">合约地址</th>
              <th className="py-2 px-4 text-left">发送方</th>
              <th className="py-2 px-4 text-left">函数名</th>
              <th className="py-2 px-4 text-left">交易哈希</th>
              <th className="py-2 px-4 text-left">是否错误</th>
              <th className="py-2 px-4 text-left">方法ID</th>
              <th className="py-2 px-4 text-left">时间</th>
              <th className="py-2 px-4 text-left">接收方</th>
              <th className="py-2 px-4 text-left">ETH</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, index) => (
              <tr key={index} className="border-b border-gray-700">
                <td
                  className="py-2 px-4 cursor-pointer"
                  onClick={() =>
                    window.open(
                      `https://sepolia.etherscan.io/block/${event.blockHash}`,
                      "_blank"
                    )
                  }
                >
                  {truncateString(event.blockHash)}
                </td>
                <td className="py-2 px-4">{event.blockNumber}</td>
                <td
                  className="py-2 px-4"
                  style={{
                    cursor: event.contractAddress ? "pointer" : "default",
                  }}
                  onClick={() =>
                    event.contractAddress &&
                    window.open(
                      `https://sepolia.etherscan.io/address/${event.contractAddress}`,
                      "_blank"
                    )
                  }
                >
                  {truncateString(event.contractAddress || "N/A")}
                </td>
                <td
                  className="py-2 px-4 cursor-pointer "
                  onClick={() =>
                    window.open(
                      `https://sepolia.etherscan.io/address/${event.from}`,
                      "_blank"
                    )
                  }
                >
                  {truncateString(event.from)}
                </td>
                <td className="py-2 px-4">{event.functionName}</td>
                <td
                  className="py-2 px-4 cursor-pointer"
                  onClick={() =>
                    window.open(
                      `https://sepolia.etherscan.io/tx/${event.hash}`,
                      "_blank"
                    )
                  }
                >
                  {truncateString(event.hash)}
                </td>
                <td className="py-2 px-4">{event.isError}</td>
                <td className="py-2 px-4">{event.methodId}</td>
                <td className="py-2 px-4">
                  {new Date(Number(event.timeStamp) * 1e3).toLocaleString()}
                </td>
                <td
                  className="py-2 px-4 cursor-pointer"
                  onClick={() =>
                    window.open(
                      `https://sepolia.etherscan.io/address/${event.to}`,
                      "_blank"
                    )
                  }
                >
                  {truncateString(event.to)}
                </td>
                <td className="py-2 px-4">{Number(event.value) / 1e18}</td>
              </tr>
            ))}
          </tbody>
        </table>
      <div className="flex justify-center mt-4 gap-2">
        <button
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          上一页
        </button>
        <span className="px-4 py-2 bg-gray-700 rounded">
          第 {page} 页
        </span>
        <button
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={() => setPage(page + 1)}
          disabled={events.length < 10}
        >
          下一页
        </button>
      </div>
      </div>
    </div>
  );
};

export default History;
