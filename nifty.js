const { default: axios } = require("axios");
const { ethers } = require("ethers");
const signNifty = require('./sign-nifty');

const niftyProtocol = '0x4b75ba193755a52f5b6398466cb3e9458610cbaf';
const libAssetData = '0x4FB6f91904D2318274CDB5812480835f6859dFEa';
const erc20Proxy = '0x474363A12b5966F7D8221c0a4B0fD31337F7BD83';
const erc721Proxy = '0x72F864fce4594E98e3378F06FA69D7824a223E44';
const erc1155Proxy = '0xa2f950ccb80909FF80eB6dCd7cD915D85A1f6c25';

const chainId = 4;

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const libAssetDataABI = [
    {
        "inputs": [
          {
            "internalType": "address",
            "name": "tokenAddress",
            "type": "address"
          }
        ],
        "name": "encodeERC20AssetData",
        "outputs": [
          {
            "internalType": "bytes",
            "name": "assetData",
            "type": "bytes"
          }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
          {
            "internalType": "address",
            "name": "tokenAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "encodeERC721AssetData",
        "outputs": [
          {
            "internalType": "bytes",
            "name": "assetData",
            "type": "bytes"
          }
        ],
        "stateMutability": "pure",
        "type": "function"
    }
];

const NiftyProtocolABI = [
    {
        "inputs": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "makerAddress",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "takerAddress",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "royaltiesAddress",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "senderAddress",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "makerAssetAmount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "takerAssetAmount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "royaltiesAmount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "expirationTimeSeconds",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "salt",
                "type": "uint256"
              },
              {
                "internalType": "bytes",
                "name": "makerAssetData",
                "type": "bytes"
              },
              {
                "internalType": "bytes",
                "name": "takerAssetData",
                "type": "bytes"
              }
            ],
            "internalType": "struct LibOrder.Order",
            "name": "order",
            "type": "tuple"
          },
          {
            "internalType": "bytes",
            "name": "signature",
            "type": "bytes"
          },
          {
            "internalType": "bytes32",
            "name": "marketplaceIdentifier",
            "type": "bytes32"
          }
        ],
        "name": "fillOrder",
        "outputs": [
          {
            "internalType": "bool",
            "name": "fulfilled",
            "type": "bool"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "makerAddress",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "takerAddress",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "royaltiesAddress",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "senderAddress",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "makerAssetAmount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "takerAssetAmount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "royaltiesAmount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "expirationTimeSeconds",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "salt",
                "type": "uint256"
              },
              {
                "internalType": "bytes",
                "name": "makerAssetData",
                "type": "bytes"
              },
              {
                "internalType": "bytes",
                "name": "takerAssetData",
                "type": "bytes"
              }
            ],
            "internalType": "struct LibOrder.Order",
            "name": "order",
            "type": "tuple"
          }
        ],
        "name": "getOrderInfo",
        "outputs": [
          {
            "components": [
              {
                "internalType": "enum LibOrder.OrderStatus",
                "name": "orderStatus",
                "type": "uint8"
              },
              {
                "internalType": "enum LibOrder.OrderType",
                "name": "orderType",
                "type": "uint8"
              },
              {
                "internalType": "bytes32",
                "name": "orderHash",
                "type": "bytes32"
              },
              {
                "internalType": "bool",
                "name": "filled",
                "type": "bool"
              }
            ],
            "internalType": "struct LibOrder.OrderInfo",
            "name": "orderInfo",
            "type": "tuple"
          }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth');
// Get a new wallet
const wallet = ethers.Wallet.createRandom().connect(provider);

const encodeERC721AssetData = (contractAddress, tokenID) => {
    const contract = new ethers.Contract(libAssetData, libAssetDataABI, provider);
  
    return contract.callStatic.encodeERC721AssetData(
      contractAddress,
      tokenID,
    );
}

const encodeERC20AssetData = (paymentTokenAddress = ZERO_ADDRESS) => {
    const contract = new ethers.Contract(libAssetData, libAssetDataABI, provider);

    return contract.callStatic.encodeERC20AssetData(
        paymentTokenAddress,
    );
}

const getOrderInfo = (order) => {
    const contract = new ethers.Contract(niftyProtocol, NiftyProtocolABI, provider);

    return contract.callStatic.getOrderInfo(
        order,
    );
}

const fillOrder = async (from, order, value) => {
    const contract = new ethers.Contract(niftyProtocol, NiftyProtocolABI, provider);
    return contract.populateTransaction.fillOrder(
      order,
      order.signature,
      '0x0000000000000000000000000000000000000000000000000000000000000000', // marketplace id
      {
        value,
        from
      }
    );
}

const listNFT = async ({
    userAddress,
    price, // wei
    contractAddress,
    tokenID,
  }) => {
    const makerAssetData = await encodeERC721AssetData(contractAddress, tokenID);
    const takerAssetData = await encodeERC20AssetData();

    const now = Math.round((Date.now() / 1000));
    const laterDate = now + 3600;
  
    const order = {
      chainId,
      exchangeAddress: niftyProtocol,
      makerAddress: userAddress,
      takerAddress: ZERO_ADDRESS,
      senderAddress: ZERO_ADDRESS,
      expirationTimeSeconds: laterDate,
      salt: now,
      makerAssetAmount: price,
      takerAssetAmount: '1', // selling one nft
      makerAssetData,
      takerAssetData,
      royaltiesAddress: ZERO_ADDRESS,
      royaltiesAmount: 0
    };
  
    const signedOrder = await signNifty(
      wallet,
      order,
      userAddress,
      chainId,
      niftyProtocol
    );

    const { orderStatus, orderType, orderHash, filled } = await getOrderInfo(signedOrder);
  
    return { ...signedOrder, orderHash };
}

(async() => {
    const order = await listNFT({
        userAddress: wallet.address,
        price: '10000000000', // wei
        contractAddress: '0x1f23afa57ee88ce0536bbf29af2c4deb8e55754f',
        tokenID: 998,
    });

    const wallet2 = ethers.Wallet.createRandom();

    const fill = await fillOrder(wallet2.address, order, '10000000000');

    console.log(fill);

    axios.post('https://api-testnets.nftrade.com/api/v1/orders', order).then((res) => {
        console.log(res);
    }).catch((e) => console.error(e));
})();
