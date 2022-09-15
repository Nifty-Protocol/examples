/* eslint-disable no-restricted-syntax */
const {
  fromRpcSig, bufferToHex, toBuffer,
} = require('ethereumjs-util');

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
