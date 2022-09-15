/* eslint-disable no-restricted-syntax */
const {
  fromRpcSig, bufferToHex, toBuffer,
} = require('ethereumjs-util');

const EIP712Domain = [
  {
    name: 'name',
    type: 'string',
  },
  {
    name: 'version',
    type: 'string',
  },
  {
    name: 'chainId',
    type: 'uint256',
  },
  {
    name: 'verifyingContract',
    type: 'address',
  },
];

const Order = [
  {
    name: 'makerAddress',
    type: 'address',
  },
  {
    name: 'takerAddress',
    type: 'address',
  },
  {
    name: 'royaltiesAddress',
    type: 'address',
  },
  {
    name: 'senderAddress',
    type: 'address',
  },
  {
    name: 'makerAssetAmount',
    type: 'uint256',
  },
  {
    name: 'takerAssetAmount',
    type: 'uint256',
  },
  {
    name: 'royaltiesAmount',
    type: 'uint256',
  },
  {
    name: 'expirationTimeSeconds',
    type: 'uint256',
  },
  {
    name: 'salt',
    type: 'uint256',
  },
  {
    name: 'makerAssetData',
    type: 'bytes',
  },
  {
    name: 'takerAssetData',
    type: 'bytes',
  },
];

/**
 *   @send - send message to and open metamask
 */
const send = (provider, data) => new Promise((resolve, reject) => provider.send(data, (err, result) => {
  if (result.error) {
    err = result.error;
  }
  if (err) {
    // console.log(err, result);
    return reject(err);
  }
  // console.log(result);
  return resolve(result.result);
}));
/**
 *   @signTypedData - function that handles signing and metamask interaction
 */
const signTypedData = async (provider, address, payload) => {
  const typedData = {
    id    : '44',
    params: [
      address,
      payload,
    ],
    jsonrpc: '2.0',
    method : 'eth_signTypedData_v4',
  };
  return send(provider, typedData);
};

/**
 *   @signTyped - main function to be called when signing
 */
module.exports = async (signer, order, from, chainId, verifyingContract) => {
  const types = {
    Order,
  };
  const domain = {
    name   : 'Nifty Exchange',
    version: '2.0',
    chainId ,
    verifyingContract,
  };

  const signature = await signer._signTypedData(domain, types, order);

  const { v, r, s } = fromRpcSig(signature);
  const ecSignature = {
    v,
    r: bufferToHex(r),
    s: bufferToHex(s),
  };
  const signatureBuffer = Buffer.concat([
    toBuffer(ecSignature.v),
    toBuffer(ecSignature.r),
    toBuffer(ecSignature.s),
    toBuffer(2),
  ]);
  const signatureHex = `0x${signatureBuffer.toString('hex')}`;

  return { ...order, signature: signatureHex };
};
