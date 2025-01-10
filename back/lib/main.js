"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const evm_processor_1 = require("@subsquid/evm-processor");
const typeorm_store_1 = require("@subsquid/typeorm-store");
const usdtAbi = __importStar(require("./abi/usdt"));
const model_1 = require("./model");
const processor = new evm_processor_1.EvmBatchProcessor()
    .setGateway('https://v2.archive.subsquid.io/network/ethereum-mainnet')
    .setRpcEndpoint({
    url: process.env.RPC_ETH_HTTP,
    rateLimit: 10
})
    .setFinalityConfirmation(75)
    .addLog({
    address: ['0xdAC17F958D2ee523a2206206994597C13D831ec7'],
    topic0: [usdtAbi.events.Transfer.topic]
});
const db = new typeorm_store_1.TypeormDatabase();
processor.run(db, async (ctx) => {
    const transfers = [];
    for (const block of ctx.blocks) {
        for (const log of block.logs) {
            const { from, to, value } = usdtAbi.events.Transfer.decode(log);
            transfers.push(new model_1.Transfer({
                id: log.id,
                from,
                to,
                value,
            }));
        }
    }
    await ctx.store.insert(transfers);
});
