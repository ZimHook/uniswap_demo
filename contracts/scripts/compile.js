const fs = require("fs");
const path = require("path");
const solc = require("solc");

// 编译合约
const compile = () => {
  // 读取合约文件
  const contractPath = process.argv[2];
  if (!contractPath) {
    throw new Error('请提供合约文件名');
  }
  const source = fs.readFileSync(path.resolve(__dirname, `../src/${contractPath}`), "utf8");

  // 配置编译参数
  const input = {
    language: "Solidity",
    sources: {
      [contractPath]: {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["*"],
        },
      },
    },
  };

  // 编译合约
  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  // 检查编译错误
  if (output.errors) {
    output.errors.forEach((error) => {
      console.error(error.formattedMessage);
    });
    throw new Error("合约编译失败");
  }

  console.log(output.contracts);
  // 获取编译结果
  const contract = output.contracts[contractPath];

  // 将编译结果写入文件
  const buildPath = path.resolve(__dirname, "../build");
  fs.mkdirSync(buildPath, { recursive: true });

  // 保存ABI
  fs.writeFileSync(
    path.resolve(buildPath, contractPath.slice(0, -4) +".abi.json"),
    JSON.stringify(contract[contractPath.slice(0, -4)].abi)
  );

  // 保存字节码
  fs.writeFileSync(
    path.resolve(buildPath, contractPath.slice(0, -4) + ".bin"),
    contract[contractPath.slice(0, -4)].evm.bytecode.object
  );

  console.log("合约编译成功!");
};

compile();
