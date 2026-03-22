Get Started
Install the MCP Toolkit and run your first AI-powered wallet server

Setup Wizard
The fastest way to get running. Clone the repository and let the wizard configure everything:

Terminal

Copy
git clone https://github.com/tetherto/wdk-mcp-toolkit.git
cd wdk-mcp-toolkit
npm install
npm run setup
The wizard will:

Prompt for your seed phrase (required)

Ask for optional API keys (WDK Indexer, MoonPay)

Generate .vscode/mcp.json with your credentials

Install required dependencies automatically

Once complete, open the project in VS Code, start the MCP server from .vscode/mcp.json, and open the chatbot with Cmd + Shift + I (or run Chat: Open Agent from the Command Palette on non-Mac).

Security - Your seed phrase is stored locally in .vscode/mcp.json, which is gitignored. Always use a dedicated development wallet with limited funds.

Manual Setup
If you prefer to set things up yourself or want to integrate the toolkit into an existing project:

Install the toolkit

Install the MCP Toolkit and the wallet modules you need:

Terminal

Copy
npm install @tetherto/wdk-mcp-toolkit @modelcontextprotocol/sdk

# Wallet modules (add any combination)
npm install @tetherto/wdk-wallet-evm    # Ethereum, Polygon, Arbitrum, etc.
npm install @tetherto/wdk-wallet-btc    # Bitcoin
Create your MCP server

Create index.js with a basic multi-chain server:

index.js

Copy
import { WdkMcpServer, CHAINS, WALLET_TOOLS, PRICING_TOOLS } from '@tetherto/wdk-mcp-toolkit'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'

const server = new WdkMcpServer('my-wallet-server', '1.0.0')

// 1. Enable WDK with your seed phrase
server.useWdk({ seed: process.env.WDK_SEED })

// 2. Register wallet modules
server.registerWallet('ethereum', WalletManagerEvm, {
  provider: 'https://eth.drpc.org'
})

server.registerWallet('bitcoin', WalletManagerBtc, {
  network: 'bitcoin',
  host: 'electrum.blockstream.info',
  port: 50001
})

// 3. Enable pricing
server.usePricing()

// 4. Register tools and start
server.registerTools([...WALLET_TOOLS, ...PRICING_TOOLS])
Connect your AI client

Add the MCP server to your AI tool's configuration:

GitHub Copilot
Cursor
Claude Code
Windsurf
Cline
Continue
Config path: .vscode/mcp.json (project-level)

.vscode/mcp.json

Copy
{
  "servers": {
    "wdk": {
      "type": "stdio",
      "command": "node",
      "args": ["index.js"],
      "env": {
        "WDK_SEED": "your twelve word seed phrase here"
      }
    }
  }
}
Then in VS Code:

Open .vscode/mcp.json and click Start above the server config

Open GitHub Copilot Chat and select Agent mode

Click Tools to verify the MCP tools are available

→ VS Code MCP documentation

Try it out

Ask your AI assistant:


Copy
What's my ethereum address?

Copy
Check my BTC balance

Copy
What's the current price of ETH in USD?

Copy
Send 10 USDT to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7 on ethereum
Write operations (sending, swapping, bridging) will show a confirmation dialog before executing. You must explicitly approve each transaction.

Optional Capabilities
Add more capabilities by installing additional packages and enabling them on the server:

Additional capabilities

Copy
import { INDEXER_TOOLS, SWAP_TOOLS, BRIDGE_TOOLS, LENDING_TOOLS, FIAT_TOOLS } from '@tetherto/wdk-mcp-toolkit'
import VeloraProtocolEvm from '@tetherto/wdk-protocol-swap-velora-evm'
import Usdt0ProtocolEvm from '@tetherto/wdk-protocol-bridge-usdt0-evm'
import AaveProtocolEvm from '@tetherto/wdk-protocol-lending-aave-evm'
import MoonPayProtocol from '@tetherto/wdk-protocol-fiat-moonpay'

// Indexer - transaction history
server.useIndexer({ apiKey: process.env.WDK_INDEXER_API_KEY })

// DeFi protocols
server.registerProtocol('ethereum', 'velora', VeloraProtocolEvm)
server.registerProtocol('ethereum', 'usdt0', Usdt0ProtocolEvm)
server.registerProtocol('ethereum', 'aave', AaveProtocolEvm)
server.registerProtocol('ethereum', 'moonpay', MoonPayProtocol, {
  secretKey: process.env.MOONPAY_SECRET_KEY,
  apiKey: process.env.MOONPAY_API_KEY
})

// Register the corresponding tools
server.registerTools([
  ...INDEXER_TOOLS,
  ...SWAP_TOOLS,
  ...BRIDGE_TOOLS,
  ...LENDING_TOOLS,
  ...FIAT_TOOLS
])
Environment Variables
Variable
Required
Description
WDK_SEED

Yes

BIP-39 seed phrase for wallet derivation

WDK_INDEXER_API_KEY

No

Enables INDEXER_TOOLS - get a key

MOONPAY_API_KEY

No

Enables FIAT_TOOLS - MoonPay Dashboard

MOONPAY_SECRET_KEY

No

Required with MOONPAY_API_KEY

Next Steps
Configuration - Wallets, tokens, protocols, custom tools, and security

API Reference - All 35 built-in MCP tools with parameters and schemas

Configuration
Configure wallets, capabilities, tokens, protocols, and custom tools

Server Setup
Create a server with a name and version:


Copy
import { WdkMcpServer } from '@tetherto/wdk-mcp-toolkit'

const server = new WdkMcpServer('my-server', '1.0.0')
The WdkMcpServer extends McpServer from the official @modelcontextprotocol/sdk with WDK-specific capabilities. All standard MCP server features are available.

Wallet Configuration
Enable WDK

Copy
server.useWdk({ seed: process.env.WDK_SEED })
The seed is a BIP-39 mnemonic phrase used for key derivation across all registered blockchains.

Never hardcode seed phrases in source code. Use environment variables or a secrets manager. The setup wizard generates a gitignored .vscode/mcp.json for local development.

Register Wallets
Register a wallet module for each blockchain you want to support:


Copy
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'
import WalletManagerSolana from '@tetherto/wdk-wallet-solana'

// EVM chains - one module handles all EVM networks
server.registerWallet('ethereum', WalletManagerEvm, {
  provider: 'https://eth.drpc.org'
})
server.registerWallet('polygon', WalletManagerEvm, {
  provider: 'https://polygon-rpc.com'
})

// Bitcoin
server.registerWallet('bitcoin', WalletManagerBtc, {
  network: 'bitcoin',
  host: 'electrum.blockstream.info',
  port: 50001
})

// Solana
server.registerWallet('solana', WalletManagerSolana, {
  provider: 'https://api.mainnet-beta.solana.com'
})
Each registerWallet() call registers the chain name and makes it available to all wallet tools. For configuration details of each wallet module, see the Wallet Modules documentation.

Capabilities
Enable optional capabilities before registering their tools:

Capability
Method
Requirement
Unlocks
Pricing

server.usePricing()

None

PRICING_TOOLS (2 tools)

Indexer

server.useIndexer({ apiKey })

WDK API key

INDEXER_TOOLS (2 tools)

Swap

server.registerProtocol(chain, label, SwapProtocol)

Swap module installed

SWAP_TOOLS (2 tools)

Bridge

server.registerProtocol(chain, label, BridgeProtocol)

Bridge module installed

BRIDGE_TOOLS (2 tools)

Lending

server.registerProtocol(chain, label, LendingProtocol)

Lending module installed

LENDING_TOOLS (8 tools)

Fiat

server.registerProtocol(chain, label, FiatProtocol, config)

Fiat module installed

FIAT_TOOLS (8 tools)

Pricing
Fetches live prices from Bitfinex. No API key needed.


Copy
server.usePricing()
Indexer
Enables querying token balances and transfer history for any address. Requires an API key.


Copy
server.useIndexer({ apiKey: process.env.WDK_INDEXER_API_KEY })
Protocols
DeFi protocols are registered per-chain:


Copy
import VeloraProtocolEvm from '@tetherto/wdk-protocol-swap-velora-evm'
import Usdt0ProtocolEvm from '@tetherto/wdk-protocol-bridge-usdt0-evm'
import AaveProtocolEvm from '@tetherto/wdk-protocol-lending-aave-evm'
import MoonPayProtocol from '@tetherto/wdk-protocol-fiat-moonpay'

server.registerProtocol('ethereum', 'velora', VeloraProtocolEvm)
server.registerProtocol('ethereum', 'usdt0', Usdt0ProtocolEvm)
server.registerProtocol('ethereum', 'aave', AaveProtocolEvm)
server.registerProtocol('ethereum', 'moonpay', MoonPayProtocol, {
  apiKey: process.env.MOONPAY_API_KEY,
  secretKey: process.env.MOONPAY_SECRET_KEY
})
Token Management
Default Tokens
USDT is auto-registered for supported chains via DEFAULT_TOKENS. You can query what's available:


Copy
server.getRegisteredTokens('ethereum')  // ['USDT']
Custom Tokens
Register additional tokens with registerToken():


Copy
server.registerToken('ethereum', 'DAI', {
  address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  decimals: 18
})
Registered tokens are available to all tools that accept a token parameter (getTokenBalance, transfer, quoteTransfer, swap, etc.).

Tool Registration
Built-in Tool Arrays
Each category exports three arrays for fine-grained control:

Export
Contents
WALLET_TOOLS

All 11 wallet tools

WALLET_READ_TOOLS

7 read-only wallet tools

WALLET_WRITE_TOOLS

4 wallet tools that modify state

PRICING_TOOLS

All 2 pricing tools

INDEXER_TOOLS

All 2 indexer tools

SWAP_TOOLS

All 2 swap tools

SWAP_READ_TOOLS

1 read-only swap tool

SWAP_WRITE_TOOLS

1 swap tool that modifies state

BRIDGE_TOOLS

All 2 bridge tools

BRIDGE_READ_TOOLS

1 read-only bridge tool

BRIDGE_WRITE_TOOLS

1 bridge tool that modifies state

LENDING_TOOLS

All 8 lending tools

LENDING_READ_TOOLS

4 read-only lending tools

LENDING_WRITE_TOOLS

4 lending tools that modify state

FIAT_TOOLS

All 8 fiat tools

FIAT_READ_TOOLS

6 read-only fiat tools

FIAT_WRITE_TOOLS

2 fiat tools that modify state

Read-Only Mode
To allow an AI agent to query data without the ability to make transactions:


Copy
import {
  WALLET_READ_TOOLS,
  PRICING_TOOLS,
  INDEXER_TOOLS,
  SWAP_READ_TOOLS
} from '@tetherto/wdk-mcp-toolkit'

server.registerTools([
  ...WALLET_READ_TOOLS,
  ...PRICING_TOOLS,
  ...INDEXER_TOOLS,
  ...SWAP_READ_TOOLS
])
Individual Tool Registration
You can also import and register tools individually:


Copy
import { getAddress, getBalance, getCurrentPrice } from '@tetherto/wdk-mcp-toolkit'

server.registerTools([getAddress, getBalance, getCurrentPrice])
Custom Tools
Add your own MCP tools alongside the built-in ones using the standard registerTool() method (inherited from McpServer). See the MCP SDK tools documentation for full details.


Copy
server.registerTool(
  'myCustomTool',
  {
    title: 'My Custom Tool',
    description: 'Description of what this tool does',
    inputSchema: z.object({
      param: z.string().describe('A required parameter')
    }),
    outputSchema: z.object({
      result: z.string()
    }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async ({ param }) => {
    return {
      content: [{ type: 'text', text: `Result: ${param}` }],
      structuredContent: { result: param }
    }
  }
)
Environment Variables
Variable
Required
Description
WDK_SEED

Yes

BIP-39 mnemonic for wallet key derivation

WDK_INDEXER_API_KEY

No

API key for WDK Indexer

MOONPAY_API_KEY

No

API key for MoonPay fiat on/off-ramp

MOONPAY_SECRET_KEY

No

Secret key for MoonPay

Security Checklist
Self-custodial wallets require careful key management. Follow these guidelines to protect user funds.


Use a dedicated development wallet - Never use production wallets with real funds for testing


Never hardcode seed phrases - Always use environment variables or .vscode/mcp.json (gitignored)


Use WALLET_READ_TOOLS for untrusted agents - Only register write tools when user confirmation is available


Call server.close() on shutdown - This disposes the WDK instance and wipes keys from memory


Use stdio transport - The default transport communicates only with the local AI client process


Review MCP annotations - Tools declare readOnlyHint and destructiveHint so clients can warn users appropriately


Keep .vscode/mcp.json gitignored - The setup wizard handles this automatically

Need Help?

AI
MCP Toolkit
API Reference
WdkMcpServer class and all 35 built-in MCP tools

WdkMcpServer
The WdkMcpServer class extends McpServer from @modelcontextprotocol/sdk with WDK-specific wallet, pricing, indexer, and protocol capabilities.

Constructor

Copy
const server = new WdkMcpServer(name: string, version: string)
Parameter
Type
Description
name

string

Server name (shown to AI clients)

version

string

Server version string

Core Methods
useWdk(config)
Initializes the WDK wallet engine. Must be called before registerWallet() or registerProtocol().


Copy
server.useWdk(config: WdkConfig): WdkMcpServer
Parameter
Type
Required
Description
config.seed

string

Yes

BIP-39 mnemonic seed phrase

Returns: WdkMcpServer (for chaining)

registerWallet(blockchain, WalletManager, config)
Registers a wallet module for a specific blockchain.


Copy
server.registerWallet<W extends typeof WalletManager>(
  blockchain: string,
  WalletManager: W,
  config: ConstructorParameters<W>[1]
): WdkMcpServer
Parameter
Type
Required
Description
blockchain

string

Yes

Chain name (e.g., 'ethereum', 'bitcoin')

WalletManager

class

Yes

Wallet module class (e.g., WalletManagerEvm)

config

object

Yes

Module-specific config (see each wallet module's docs)

Requires: useWdk() called first

registerProtocol(chain, label, Protocol, config?)
Registers a DeFi protocol (swap, bridge, lending, or fiat) for a chain.


Copy
server.registerProtocol<P extends typeof SwapProtocol | typeof BridgeProtocol | typeof LendingProtocol | typeof FiatProtocol>(
  chain: string,
  label: string,
  Protocol: P,
  config?: ConstructorParameters<P>[1]
): WdkMcpServer
Parameter
Type
Required
Description
chain

string

Yes

Chain name (must have a wallet registered)

label

string

Yes

Protocol identifier (e.g., 'velora', 'aave')

Protocol

class

Yes

Protocol module class

config

object

No

Protocol-specific config

Requires: useWdk() called first

useIndexer(config)
Enables the WDK Indexer client for querying token balances and transfer history.


Copy
server.useIndexer(config: { apiKey: string }): WdkMcpServer
Parameter
Type
Required
Description
config.apiKey

string

Yes

WDK Indexer API key

usePricing()
Enables the Bitfinex pricing client for current and historical prices.


Copy
server.usePricing(): WdkMcpServer
registerTools(tools)
Registers multiple MCP tools at once.


Copy
server.registerTools(tools: ToolFunction[]): WdkMcpServer
registerToken(chain, symbol, token)
Registers a custom token for a chain.


Copy
server.registerToken(chain: string, symbol: string, token: TokenInfo): WdkMcpServer
Parameter
Type
Description
chain

string

Chain name

symbol

string

Token symbol (e.g., 'USDT')

token.address

string

Token contract address

token.decimals

number

Token decimal places

close()
Disposes the WDK instance and clears seed material from memory. Call this when shutting down the server.


Copy
server.close(): void
Query Methods
Method
Returns
Description
getChains()

string[]

Registered blockchain names

getTokenInfo(chain, symbol)

TokenInfo | undefined

Token address and decimals

getRegisteredTokens(chain)

string[]

Registered token symbols for a chain

getSwapChains()

string[]

Chains with swap protocols

getSwapProtocols(chain)

string[]

Swap protocol labels for a chain

getBridgeChains()

string[]

Chains with bridge protocols

getBridgeProtocols(chain)

string[]

Bridge protocol labels for a chain

getLendingChains()

string[]

Chains with lending protocols

getLendingProtocols(chain)

string[]

Lending protocol labels for a chain

getFiatChains()

string[]

Chains with fiat protocols

getFiatProtocols(chain)

string[]

Fiat protocol labels for a chain

Getters
Getter
Type
Description
server.wdk

WalletKit

WDK instance (after useWdk())

server.indexerClient

WdkIndexerClient

Indexer client (after useIndexer())

server.pricingClient

WdkPricingClient

Pricing client (after usePricing())

Types

Copy
type WdkConfig = {
  seed?: string
}

type TokenInfo = {
  address: string
  decimals: number
}

type ToolFunction = (server: WdkMcpServer) => void
Built-in MCP Tools
All tools use Zod for input/output validation and include MCP tool annotations that describe their behavior to AI clients.

MCP Annotations
Every tool declares these annotations:

Annotation
Type
Meaning
readOnlyHint

boolean

Tool does not modify state

destructiveHint

boolean

Tool may spend funds or make irreversible changes

idempotentHint

boolean

Calling multiple times produces the same result

openWorldHint

boolean

Tool interacts with external systems

Human Confirmation - All tools where destructiveHint: true use MCP elicitations to show a confirmation dialog before broadcasting. The user must explicitly approve each transaction.

Wallet Tools
Requires: useWdk() + registerWallet()

getAddress
Get the wallet address for a blockchain. Read-only.

Input:

Parameter
Type
Required
Description
chain

enum

Yes

The blockchain to get the address for

Output:

Field
Type
Description
address

string

The wallet address

getBalance
Get the native token balance for a blockchain (ETH, BTC, SOL, etc.). Read-only.

Input:

Parameter
Type
Required
Description
chain

enum

Yes

The blockchain to query

Output:

Field
Type
Description
balance

string

Balance in base units (wei, satoshis, etc.)

getTokenBalance
Get the balance of a registered token (USDT, XAU₮, etc.). Read-only.

Input:

Parameter
Type
Required
Description
chain

enum

Yes

The blockchain to query

token

string

Yes

Token symbol (e.g., "USDT")

Output:

Field
Type
Description
balance

string

Human-readable token balance

balanceBaseUnits

string

Balance in smallest unit

getFeeRates
Get current network fee rates. Read-only.

Input:

Parameter
Type
Required
Description
chain

enum

Yes

The blockchain to query

Output:

Field
Type
Description
normal

string

Normal fee rate (balanced speed)

fast

string

Fast fee rate (higher cost, faster confirmation)

Fee units vary by chain: satoshis/byte (Bitcoin), wei (Ethereum), or chain-specific units.

getMaxSpendableBtc
Get the maximum spendable Bitcoin amount after fees. Read-only. Bitcoin-only.

Input: None

Output:

Field
Type
Description
amount

string

Maximum spendable amount (satoshis)

fee

string

Estimated transaction fee (satoshis)

changeValue

string

Expected change output (satoshis)

quoteSendTransaction
Estimate the fee for sending native currency. Read-only. Does not broadcast.

Input:

Parameter
Type
Required
Description
chain

enum

Yes

The blockchain

to

string

Yes

Recipient address

value

string

Yes

Amount in base units (wei, satoshis)

Output:

Field
Type
Description
fee

string

Estimated transaction fee in base units

quoteTransfer
Estimate the fee for transferring a token. Read-only. Does not broadcast.

Input:

Parameter
Type
Required
Description
chain

enum

Yes

The blockchain

token

string

Yes

Token symbol (e.g., "USDT")

recipient

string

Yes

Recipient address

amount

string

Yes

Amount in human-readable format (e.g., "10")

Output:

Field
Type
Description
fee

string

Estimated transaction fee in base units

sendTransaction
Send native currency (ETH, BTC, etc.). Destructive - requires user confirmation.

Input:

Parameter
Type
Required
Description
chain

enum

Yes

The blockchain

to

string

Yes

Recipient address

value

string

Yes

Amount in base units (wei, satoshis)

Output:

Field
Type
Description
hash

string

Transaction hash

fee

string

Actual fee paid

This tool shows a confirmation dialog with transaction details before broadcasting. The user must approve the transaction explicitly.

transfer
Transfer a registered token. Destructive - requires user confirmation.

Input:

Parameter
Type
Required
Description
chain

enum

Yes

The blockchain

token

string

Yes

Token symbol (e.g., "USDT")

to

string

Yes

Recipient address

amount

string

Yes

Amount in human-readable format (e.g., "100")

Output:

Field
Type
Description
hash

string

Transaction hash

fee

string

Actual fee paid

This tool shows a confirmation dialog with transaction details before broadcasting. The user must approve the transaction explicitly.

sign
Sign an arbitrary message with the wallet's private key. Does not reveal the private key.

Input:

Parameter
Type
Required
Description
chain

enum

Yes

The blockchain

message

string

Yes

Message to sign

Output:

Field
Type
Description
signature

string

Cryptographic signature

verify
Verify that a signature is valid for a given message. Read-only.

Input:

Parameter
Type
Required
Description
chain

enum

Yes

The blockchain

message

string

Yes

Original message

signature

string

Yes

Signature to verify

Output:

Field
Type
Description
valid

boolean

Whether the signature is valid

Pricing Tools
Requires: usePricing()

getCurrentPrice
Get the current spot price from Bitfinex. Read-only.

Input:

Parameter
Type
Required
Description
base

string

Yes

Base currency (e.g., "BTC", "ETH")

quote

string

Yes

Quote currency (e.g., "USD", "USDT")

Output:

Field
Type
Description
base

string

Base currency

quote

string

Quote currency

price

number

Current spot price

getHistoricalPrice
Get historical price data (OHLCV candles) from Bitfinex. Read-only.

Input:

Parameter
Type
Required
Description
from

string

Yes

Base currency (e.g., "BTC")

to

string

Yes

Quote currency (e.g., "USD")

start

number

No

Start timestamp (ms, unix epoch)

end

number

No

End timestamp (ms, unix epoch)

Output:

Field
Type
Description
from

string

Base currency

to

string

Quote currency

start

number

Start timestamp (if provided)

end

number

End timestamp (if provided)

points

number[][]

Array of [timestamp, open, close, high, low, volume]

Long time ranges are automatically downscaled to ≤100 data points.

Indexer Tools
Requires: useIndexer()

getIndexerTokenBalance
Get token balance for any address via the WDK Indexer API. Read-only.

Input:

Parameter
Type
Required
Description
blockchain

enum

Yes

Blockchain to query

token

enum

Yes

Token (e.g., "usdt", "xaut", "btc")

address

string

Yes

Wallet address

Output:

Field
Type
Description
tokenBalance.blockchain

string

Blockchain name

tokenBalance.token

string

Token name

tokenBalance.amount

string

Token balance

This queries the indexed balance, which may have slight delay compared to real-time blockchain state. For your own wallet's balance, use getBalance or getTokenBalance instead.

getTokenTransfers
Get token transfer history for an address. Read-only.

Input:

Parameter
Type
Required
Description
blockchain

enum

Yes

Blockchain to query

token

enum

Yes

Token (e.g., "usdt", "xaut", "btc")

address

string

Yes

Wallet address

limit

number

No

Results per page (1–1000, default: 10)

fromTs

number

No

Start timestamp (unix seconds)

toTs

number

No

End timestamp (unix seconds)

sort

enum

No

"asc" or "desc" (default: "desc")

Output:

Field
Type
Description
transfers

object[]

Array of transfer records

transfers[].blockchain

string

Blockchain

transfers[].blockNumber

number

Block number

transfers[].transactionHash

string

Transaction hash

transfers[].token

string

Token

transfers[].amount

string

Transfer amount

transfers[].timestamp

number

Unix timestamp

transfers[].from

string

Sender address

transfers[].to

string

Recipient address

Swap Tools
Requires: registerProtocol() with a swap protocol

quoteSwap
Get a swap quote without executing. Read-only.

Input:

Parameter
Type
Required
Description
chain

enum

Yes

Blockchain with swap protocol

tokenIn

string

Yes

Token to sell (e.g., "USDT")

tokenOut

string

Yes

Token to buy (e.g., "WETH")

amount

string

Yes

Amount in human-readable units

side

enum

Yes

"sell" or "buy"

Output:

Field
Type
Description
protocol

string

DEX protocol used

tokenIn

string

Input token symbol

tokenOut

string

Output token symbol

tokenInAmount

string

Input amount (human-readable)

tokenOutAmount

string

Output amount (human-readable)

fee

string

Estimated fee

swap
Execute a token swap. Destructive - requires user confirmation.

Input:

Parameter
Type
Required
Description
chain

enum

Yes

Blockchain with swap protocol

tokenIn

string

Yes

Token to sell

tokenOut

string

Yes

Token to buy

amount

string

Yes

Amount in human-readable units

side

enum

Yes

"sell" or "buy"

to

string

No

Recipient address (defaults to wallet)

Output:

Field
Type
Description
success

boolean

Whether the swap succeeded

protocol

string

DEX protocol used

hash

string

Transaction hash

tokenIn

string

Input token symbol

tokenOut

string

Output token symbol

tokenInAmount

string

Actual input amount

tokenOutAmount

string

Actual output amount

fee

string

Fee paid

This tool quotes the swap first, then shows a confirmation dialog before broadcasting.

Bridge Tools
Requires: registerProtocol() with a bridge protocol

quoteBridge
Get a bridge quote without executing. Read-only.

Input:

Parameter
Type
Required
Description
chain

enum

Yes

Source blockchain

targetChain

string

Yes

Destination blockchain

token

string

Yes

Token to bridge (e.g., "USDT")

amount

string

Yes

Amount in human-readable units

recipient

string

No

Recipient on target chain (defaults to wallet)

Output:

Field
Type
Description
protocol

string

Bridge protocol used

sourceChain

string

Source blockchain

targetChain

string

Destination blockchain

token

string

Token symbol

amount

string

Amount to bridge

fee

string

Estimated gas fee

bridgeFee

string

Bridge protocol fee

bridge
Execute a cross-chain bridge. Destructive - requires user confirmation.

Input:

Parameter
Type
Required
Description
chain

enum

Yes

Source blockchain

targetChain

string

Yes

Destination blockchain

token

string

Yes

Token to bridge

amount

string

Yes

Amount in human-readable units

recipient

string

No

Recipient on target chain (defaults to wallet)

Output:

Field
Type
Description
success

boolean

Whether the bridge succeeded

protocol

string

Bridge protocol used

hash

string

Transaction hash

sourceChain

string

Source blockchain

targetChain

string

Destination blockchain

token

string

Token symbol

amount

string

Amount bridged

fee

string

Gas fee paid

bridgeFee

string

Bridge protocol fee paid

Bridge finality varies by target chain - tokens may take minutes to hours to arrive.

Lending Tools
Requires: registerProtocol() with a lending protocol

quoteSupply
Get a fee estimate for supplying tokens to a lending pool. Read-only.

Input:

Parameter
Type
Required
Description
chain

enum

Yes

Blockchain with lending protocol

token

string

Yes

Token to supply

amount

string

Yes

Amount in human-readable units

onBehalfOf

string

No

Address to receive aTokens (defaults to wallet)

Output:

Field
Type
Description
protocol

string

Lending protocol used

chain

string

Blockchain

token

string

Token symbol

amount

string

Amount to supply

fee

string

Estimated gas fee

supply
Supply tokens to a lending pool. Destructive - requires user confirmation.

Same input as quoteSupply. Output includes success, protocol, hash, token, amount, and fee.

quoteWithdraw
Estimate fee for withdrawing from a lending pool. Read-only.

Input:

Parameter
Type
Required
Description
chain

enum

Yes

Blockchain

token

string

Yes

Token to withdraw

amount

string

Yes

Amount in human-readable units

Output: Same structure as quoteSupply.

withdraw
Withdraw tokens from a lending pool. Destructive - requires user confirmation.

Same input as quoteWithdraw. Output includes success, protocol, hash, token, amount, and fee.

quoteBorrow
Estimate fee for borrowing from a lending pool. Read-only.

Input:

Parameter
Type
Required
Description
chain

enum

Yes

Blockchain

token

string

Yes

Token to borrow

amount

string

Yes

Amount in human-readable units

Output: Same structure as quoteSupply.

borrow
Borrow tokens from a lending pool. Destructive - requires user confirmation.

Same input as quoteBorrow. Output includes success, protocol, hash, token, amount, and fee.

quoteRepay
Estimate fee for repaying a loan. Read-only.

Input:

Parameter
Type
Required
Description
chain

enum

Yes

Blockchain

token

string

Yes

Token to repay

amount

string

Yes

Amount in human-readable units

Output: Same structure as quoteSupply.

repay
Repay borrowed tokens. Destructive - requires user confirmation.

Same input as quoteRepay. Output includes success, protocol, hash, token, amount, and fee.

Fiat Tools
Requires: registerProtocol() with a fiat protocol

quoteBuy
Get a quote for purchasing crypto with fiat. Read-only.

Input:

Parameter
Type
Required
Description
chain

enum

Yes

Blockchain for the fiat protocol

cryptoAsset

string

Yes

Crypto asset code (e.g., "eth", "btc")

fiatCurrency

string

Yes

Fiat currency code (e.g., "USD", "EUR")

amount

string

Yes

Amount to quote

amountType

enum

Yes

"crypto" or "fiat"

Output:

Field
Type
Description
protocol

string

Fiat protocol used

cryptoAsset

string

Crypto asset code

fiatCurrency

string

Fiat currency code

cryptoAmount

string

Crypto amount (base units)

fiatAmount

string

Fiat amount (smallest units, e.g., cents)

fee

string

Total fee (fiat smallest units)

rate

string

Exchange rate

buy
Execute a fiat-to-crypto purchase. Destructive - requires user confirmation.

Same input as quoteBuy. Output includes success, protocol, redirect URL or transaction details.

quoteSell
Get a quote for selling crypto to fiat. Read-only.

Same input structure as quoteBuy. Same output structure.

sell
Execute a crypto-to-fiat sale. Destructive - requires user confirmation.

Same input as quoteSell. Output includes success, protocol, and transaction details.

getTransactionDetail
Get details of a fiat transaction by ID. Read-only.

Input:

Parameter
Type
Required
Description
chain

enum

Yes

Blockchain

transactionId

string

Yes

Transaction ID from the fiat provider

getSupportedCryptoAssets
List crypto assets supported by the fiat provider. Read-only.

Input:

Parameter
Type
Required
Description
chain

enum

Yes

Blockchain

getSupportedFiatCurrencies
List fiat currencies supported by the fiat provider. Read-only.

Input:

Parameter
Type
Required
Description
chain

enum

Yes

Blockchain

getSupportedCountries
List countries supported by the fiat provider. Read-only.

Input:

Parameter
Type
Required
Description
chain

enum

Yes

Blockchain

Utility Exports
Utility functions for converting between human-readable amounts and blockchain base units:


Copy
import {
  parseAmountToBaseUnits,
  formatBaseUnitsToAmount,
  AmountParseError,
  AMOUNT_ERROR_CODES
} from '@tetherto/wdk-mcp-toolkit'
parseAmountToBaseUnits(amount, decimals)
Converts a human-readable amount string to BigInt base units without floating-point errors.


Copy
parseAmountToBaseUnits('2.01', 6)   // → 2010000n
parseAmountToBaseUnits('100', 18)   // → 100000000000000000000n
parseAmountToBaseUnits('1,000.50', 6) // → 1000500000n
formatBaseUnitsToAmount(baseUnits, decimals)
Converts BigInt base units to a human-readable string.


Copy
formatBaseUnitsToAmount(2010000n, 6)  // → '2.01'
formatBaseUnitsToAmount(100000000000000000000n, 18) // → '100'
AmountParseError
Custom error class with a code property for programmatic handling:

Error Code
Description
EMPTY_STRING

Empty amount string

INVALID_FORMAT

Not a valid number

NEGATIVE_AMOUNT

Negative amounts not allowed

EXCESSIVE_PRECISION

More decimal places than token supports

INVALID_DECIMALS

Decimals value out of range

SCIENTIFIC_NOTATION_PRECISION

Scientific notation exceeds precision

Need Help?

