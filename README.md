### Musica Application
## Introduction
As crafting music is an artistic endeavor demanding significant time and effort, singers must receive rewards. The Musica app offers a platform for singers to market their music. Within this platform, singers can share their music while listeners have the opportunity to hear each track once, offer feedback, and express their approval by liking it. However, to download or listen to the music multiple times, payment is required. In summary, this application offers these features:
- Create, remove, or modify a piece of music.
- Post, remove, or modify a comment.
- Express approval for music, or withdraw approval.
- Stream each musical piece once.
- Make a payment for downloading the music.
  
## How to run

To develop fully locally, first install [Docker](https://www.docker.com/get-started/) and [VS Code](https://code.visualstudio.com/) and start them on your machine.
Next, click the following button to open the dev container locally:

[![Open locally in Dev Containers](https://img.shields.io/static/v1?label=Dev%20Containers&message=Open&color=blue&logo=visualstudiocode)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/dacadeorg/icp-azle-201)

## How to deploy canisters implemented in the course

### Ledger canister
`./deploy-local-ledger.sh` - deploys a local Ledger canister. IC works differently when run locally so there is no default network token available and you have to deploy it yourself. Remember that it's not a token like ERC-20 in Ethereum, it's a native token for ICP, just deployed separately.
This canister is described in the `dfx.json`:
```
	"ledger_canister": {
  	"type": "custom",
  	"candid": "https://raw.githubusercontent.com/dfinity/ic/928caf66c35627efe407006230beee60ad38f090/rs/rosetta-api/icp_ledger/ledger.did",
  	"wasm": "https://download.dfinity.systems/ic/928caf66c35627efe407006230beee60ad38f090/canisters/ledger-canister.wasm.gz",
  	"remote": {
    	"id": {
      	"ic": "ryjl3-tyaaa-aaaaa-aaaba-cai"
    	}
  	}
	}
```
`remote.id.ic` - that is the principal of the Ledger canister and it will be available by this principal when you work with the ledger.

Also, in the scope of this script, a minter identity is created which can be used for minting tokens
for the testing purposes.
Additionally, the default identity is pre-populated with 1000_000_000_000 e8s which is equal to 10_000 * 10**8 ICP.
The decimals value for ICP is 10**8.

List identities:
`dfx identity list`

Switch to the minter identity:
`dfx identity use minter`

Transfer ICP:
`dfx ledger transfer <ADDRESS> --memo 0 --icp 100 --fee 0`
where:
 - `--memo` is some correlation id that can be set to identify some particular transactions (we use that in the marketplace canister).
 - `--icp` is the transfer amount
 - `--fee` is the transaction fee. In this case it's 0 because we make this transfer as the minter idenity thus this transaction is of type MINT, not TRANSFER.
 - `<ADDRESS>` is the address of the recipient. To get the address from the principal, you can use the helper function from the marketplace canister - `getAddressFromPrincipal(principal: Principal)`, it can be called via the Candid UI.

### ICRC2 ledger canister

`deploy-local-icrc-ledger.sh` - deploys an ICRC2 canister.

Transfer ICRC token:
`dfx canister call icrc1_ledger_canister icrc1_transfer '(record { to = record { owner = principal "<PRINCIPAL>";};  amount = <AMOUNT>;})'`
where:
- `<PRINCIPAL>` is the principal string of the receiver
- `<AMOUNT>` is the amount of token to be transferred

### Internet identity canister

`deploy-local-identity.sh` - deploys an identity canister and outputs the canister id to `.env` as the `IDENTITY_CANISTER_ID` variable. Once it's deployed, the `js-agent` library will be talking to it to register identities. There is UI that acts as a wallet where you can select existing identities
or create a new one.

### Marketplace canister

Switch to the default identity:
`dfx identity use default`

`deploy-local-backend-canister.sh` - deploys the marketplace canister where the business logic is implemented and outputs the canister id to `.env` as the `BACKEND_CANISTER_ID` variable.
Basically, it implements functions like add, view, update, delete, and buy products + a set of helper functions.

### Marketplace frontend canister
`dfx deploy dfinity_js_frontend` - deployes the frontend app for the `dfinity_js_backend` canister on IC.
