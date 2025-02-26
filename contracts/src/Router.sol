// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Router {
    // 流动性池结构
    struct Pool {
        uint256 token0Reserve;
        uint256 token1Reserve;
        uint256 totalSupply;
        mapping(address => uint256) balances;
    }

    // 存储所有流动性池
    mapping(address => mapping(address => Pool)) public pools;

    // 事件
    event AddLiquidity(address indexed token0, address indexed token1, uint256 amount0, uint256 amount1, uint256 liquidity);
    event Swap(address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);

    // 添加流动性
    function addLiquidity(
        address token0,
        address token1,
        uint256 amount0Desired,
        uint256 amount1Desired,
        uint256 amount0Min,
        uint256 amount1Min
    ) external returns (uint256 amount0, uint256 amount1, uint256 liquidity) {
        // 确保token0地址小于token1地址
        require(token0 < token1, "INVALID_TOKEN_ORDER");
        
        Pool storage pool = pools[token0][token1];
        
        if (pool.totalSupply == 0) {
            // 首次添加流动性
            amount0 = amount0Desired;
            amount1 = amount1Desired;
            liquidity = _sqrt(amount0 * amount1);
        } else {
            // 计算应该添加的比例
            uint256 amount1Optimal = (amount0Desired * pool.token1Reserve) / pool.token0Reserve;
            
            if (amount1Optimal <= amount1Desired) {
                require(amount1Optimal >= amount1Min, "INSUFFICIENT_1_AMOUNT");
                amount0 = amount0Desired;
                amount1 = amount1Optimal;
            } else {
                uint256 amount0Optimal = (amount1Desired * pool.token0Reserve) / pool.token1Reserve;
                require(amount0Optimal >= amount0Min, "INSUFFICIENT_0_AMOUNT");
                amount0 = amount0Optimal;
                amount1 = amount1Desired;
            }
            
            liquidity = _min(
                (amount0 * pool.totalSupply) / pool.token0Reserve,
                (amount1 * pool.totalSupply) / pool.token1Reserve
            );
        }

        require(liquidity > 0, "INSUFFICIENT_LIQUIDITY_MINTED");

        // 更新池子状态
        pool.token0Reserve += amount0;
        pool.token1Reserve += amount1;
        pool.totalSupply += liquidity;
        pool.balances[msg.sender] += liquidity;

        // 转移代币
        _safeTransferFrom(token0, msg.sender, address(this), amount0);
        _safeTransferFrom(token1, msg.sender, address(this), amount1);

        emit AddLiquidity(token0, token1, amount0, amount1, liquidity);
    }

    // 交换代币
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin
    ) external returns (uint256 amountOut) {
        require(amountIn > 0, "INSUFFICIENT_INPUT_AMOUNT");
        
        Pool storage pool;
        bool isToken0 = tokenIn < tokenOut;
        
        if (isToken0) {
            pool = pools[tokenIn][tokenOut];
        } else {
            pool = pools[tokenOut][tokenIn];
        }

        uint256 reserveIn = isToken0 ? pool.token0Reserve : pool.token1Reserve;
        uint256 reserveOut = isToken0 ? pool.token1Reserve : pool.token0Reserve;

        // 计算输出金额
        amountOut = getAmountOut(amountIn, reserveIn, reserveOut);
        require(amountOut >= amountOutMin, "INSUFFICIENT_OUTPUT_AMOUNT");

        // 更新池子状态
        if (isToken0) {
            pool.token0Reserve += amountIn;
            pool.token1Reserve -= amountOut;
        } else {
            pool.token1Reserve += amountIn;
            pool.token0Reserve -= amountOut;
        }

        // 转移代币
        _safeTransferFrom(tokenIn, msg.sender, address(this), amountIn);
        _safeTransfer(tokenOut, msg.sender, amountOut);

        emit Swap(tokenIn, tokenOut, amountIn, amountOut);
    }

    // 计算输出金额
    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) public pure returns (uint256) {
        require(amountIn > 0, "INSUFFICIENT_INPUT_AMOUNT");
        require(reserveIn > 0 && reserveOut > 0, "INSUFFICIENT_LIQUIDITY");
        
        uint256 amountInWithFee = amountIn * 997; // 0.3% 手续费
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;
        
        return numerator / denominator;
    }

    // 工具函数
    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    // 代币转账相关函数
    function _safeTransfer(address token, address to, uint256 value) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(0xa9059cbb, to, value)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "TRANSFER_FAILED");
    }

    function _safeTransferFrom(address token, address from, address to, uint256 value) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(0x23b872dd, from, to, value)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "TRANSFER_FROM_FAILED");
    }
}

