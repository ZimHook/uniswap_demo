# Check if forge is installed
if ! command -v forge &> /dev/null; then
    echo "forge not found, installing foundry..."
    curl -L https://foundry.paradigm.xyz | bash
    source $HOME/.bashrc
    foundryup
fi

# 0x781c362753eA95126e6F99FDb70f9d9E8EEcEf21
forge create --rpc-url https://sepolia.drpc.org --private-key 72d3c4b73d40392b85277a6673299cb8ca4bfa8f94b597ac7db87cdf7b521747 ./contracts/src/Router.sol:Router
# 0x63e1942bBf50Eb72f748538d0A14d3C644567273
forge create --rpc-url https://sepolia.drpc.org --private-key 72d3c4b73d40392b85277a6673299cb8ca4bfa8f94b597ac7db87cdf7b521747 ./contracts/src/ERC20.sol:ERC20 --constructor-args "MOCK_ERC20" "TST" 18  
# 0xAd77Bcf7Cd60580c5A936f7d2A4e451f3F63e33a
forge create --rpc-url https://sepolia.drpc.org --private-key 72d3c4b73d40392b85277a6673299cb8ca4bfa8f94b597ac7db87cdf7b521747 ./contracts/src/ERC20.sol:ERC20 --constructor-args "MOCK_USDC" "USDC" 6  
