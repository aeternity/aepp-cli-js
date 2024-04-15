# AECLI commands

- `account`
    - [`sign`](#sign) — sign a transaction using wallet
    - [`sign-message`](#sign-message) — sign a personal message using wallet
    - [`verify-message`](#verify-message) — check if message was signed by address
    - [`address`](#address) — get wallet address and optionally private key
    - [`create`](#create) — create a wallet by a private key or generate a new one
- [`spend`](#spend) — send coins to another account or contract
- `name`
    - [`full-claim`](#full-claim) — claim an AENS name in a single command
    - [`pre-claim`](#pre-claim) — pre-claim an AENS name
    - [`claim`](#claim) — claim an AENS name (requires pre-claim)
    - [`bid`](#bid) — bid on name in auction
    - [`update`](#update) — update a name pointer
    - [`extend`](#extend) — extend name TTL
    - [`revoke`](#revoke) — revoke an AENS name
    - [`transfer`](#transfer) — transfer a name to another account
- `contract`
    - [`compile`](#compile) — compile a contract to get bytecode
    - [`encode-calldata`](#encode-calldata) — encode calldata for contract call
    - [`decode-call-result`](#decode-call-result) — decode contract call result
    - [`call`](#call) — execute a function of the contract
    - [`deploy`](#deploy) — deploy a contract on the chain
- `oracle`
    - [`get`](#get) — print oracle details
    - [`create`](#create-1) — register current account as oracle
    - [`extend`](#extend-1) — extend oracle's time to leave
    - [`create-query`](#create-query) — create an oracle query
    - [`respond-query`](#respond-query) — respond to an oracle query
- `chain`
    - [`top`](#top) — query the top key/micro block of the chain
    - [`status`](#status) — query node version, network id, and related details of the selected node
    - [`ttl`](#ttl) — get relative TTL by absolute TTL
    - [`play`](#play) — prints blocks from top until condition
    - [`broadcast`](#broadcast) — send signed transaction to the chain
- [`inspect`](#inspect) — get details of a node entity
- `tx`
    - [`spend`](#spend-1) — build spend transaction
    - [`name-preclaim`](#name-preclaim) — build name preclaim transaction
    - [`name-claim`](#name-claim) — build name claim transaction
    - [`name-update`](#name-update) — build name update transaction
    - [`name-transfer`](#name-transfer) — build name transfer transaction
    - [`name-revoke`](#name-revoke) — build name revoke transaction
    - [`contract-deploy`](#contract-deploy) — build contract deploy transaction
    - [`contract-call`](#contract-call) — build contract call transaction
    - [`oracle-register`](#oracle-register) — build oracle register transaction
    - [`oracle-extend`](#oracle-extend) — build oracle extend transaction
    - [`oracle-post-query`](#oracle-post-query) — build oracle post query transaction
    - [`oracle-respond`](#oracle-respond) — build oracle respond transaction
    - [`verify`](#verify) — verify transaction using node
- [`config`](#config) — print the current sdk configuration
- [`select-node`](#select-node) — specify node to use in other commands
- [`select-compiler`](#select-compiler) — specify compiler to use in other commands


# account group


## sign
```
aecli account sign [options] <wallet_path> <tx>
```

Sign a transaction using wallet. Useful in offline signing scheme.

#### Options
`-u, --url [nodeUrl]`  
Node to connect to (default: mainnet, env: AECLI_NODE_URL).  
`-f, --force`  
Ignore node version compatibility check.  
`--networkId [networkId]`  
Network id.  
`-P, --password [password]`  
Wallet Password, may be recorded to shell history (env: AECLI_WALLET_PASSWORD).  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli account sign ./wallet.json tx_+FoMAaEBzqet5HDJ+Z2dTkAIgKhvHUm7REti8Rqeu2S7z+tz/vOhARX7Ovvi4N8rfRN/Dsvb2ei7AJ3ysIkBrG5pnY6qW3W7iQVrx14tYxAAAIYPUN430AAAKoBebL57
```


## sign-message
```
aecli account sign-message [options] <wallet_path> [data...]
```

Sign a personal message using wallet.

#### Options
`--filePath [path]`  
Specify the path to the file for signing (ignore "data" argument and use file instead).  
`-P, --password [password]`  
Wallet Password, may be recorded to shell history (env: AECLI_WALLET_PASSWORD).  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli account sign-message ./wallet.json 'message to sign'
```


## verify-message
```
aecli account verify-message [options] <address> <hexSignature> [data...]
```

Check if message was signed by address.

#### Options
`--filePath [path]`  
Specify the path to the file (ignore "data" argument and use file instead).  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli account verify-message ak_21A27UVVt3hDkBE5J7rhhqnH5YNb4Y1dqo4PnSybrH85pnWo7E f2f268f195d4747568f38f9efd36e72606dc356c0b8db9fdfae5f1f9c207dbc354c57c29397837d911516aef184b0ddbed7d16d77caf9ffb3f42fe2bcc15c30e 'message to sign'
```


## address
```
aecli account address [options] <wallet_path>
```

Get wallet address and optionally private key.

#### Options
`--privateKey`  
Print private key.  
`--forcePrompt`  
Force prompting.  
`-P, --password [password]`  
Wallet Password, may be recorded to shell history (env: AECLI_WALLET_PASSWORD).  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli account address ./wallet.json  # show only public key
$ aecli account address ./wallet.json --privateKey  # show public key and private key
```


## create
```
aecli account create [options] <wallet_path> [privkey]
```

Create a password-encrypted wallet by a secret key. Secret key can be provided in options, or cli will generate one. This command creates ethereum-like keyfile.

#### Arguments
`wallet_path`  
  
`privkey`  
Secret key as 64-bytes encoded as hex.  

#### Options
`--overwrite`  
Overwrite if exist.  
`-P, --password [password]`  
Wallet Password, may be recorded to shell history (env: AECLI_WALLET_PASSWORD).  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli account create ./wallet.json
$ aecli account create ./wallet.json 9ebd7beda0c79af72a42ece3821a56eff16359b6df376cf049aee995565f022f840c974b97164776454ba119d84edc4d6058a8dec92b6edc578ab2d30b4c4200
```


## spend
```
aecli spend [options] <wallet> <receiver> <amount>
```

Sends coins to another account or contract.

#### Arguments
`wallet`  
A path to wallet file.  
`receiver`  
Address or name of recipient account.  
`amount`  
Amount of coins to send in aettos/ae (example: 1.2ae), or percent of sender balance (example: 42%).  

#### Options
`--payload [payload]`  
Transaction payload as text (default: "").  
`-F, --fee [fee]`  
Override the transaction fee.  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: 3).  
`-N, --nonce [nonce]`  
Override the nonce that the transaction is going to be sent with.  
`-u, --url [nodeUrl]`  
Node to connect to (default: mainnet, env: AECLI_NODE_URL).  
`-P, --password [password]`  
Wallet Password, may be recorded to shell history (env: AECLI_WALLET_PASSWORD).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli spend ./wallet.json ak_21A27UVVt3hDkBE5J7rhhqnH5YNb4Y1dqo4PnSybrH85pnWo7E 100
$ aecli spend ./wallet.json example-name.chain 1.23ae
$ aecli spend ./wallet.json ak_21A27UVVt3hDkBE5J7rhhqnH5YNb4Y1dqo4PnSybrH85pnWo7E 20% --ttl 20
```


# name group


## full-claim
```
aecli name full-claim [options] <wallet_path> <name>
```

Claim an AENS name in a single command. This command signs and sends a pre-claim transaction and waits until one block gets mined. After that, it sends a claim transaction. At the end, the update transaction is submitted, making a name point to the current account. 

A name in arguments should end with ".chain". Be careful, shorter names are more expensive. If the name is shorter than 13 characters (without ".chain") then it won't be claimed immediately but would start an auction instead.

#### Options
`--nameFee [nameFee]`  
Amount of coins to pay for name.  
`--nameTtl [nameTtl]`  
Validity of name. (default: 180000).  
`--clientTtl [clientTtl]`  
A suggestion measured in seconds on how long clients should cache name pointers (default: 1 hour).  
`-u, --url [nodeUrl]`  
Node to connect to (default: mainnet, env: AECLI_NODE_URL).  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: 3).  
`-F, --fee [fee]`  
Override the transaction fee.  
`--nonce [nonce]`  
Override the nonce that the transaction is going to be sent with.  
`-P, --password [password]`  
Wallet Password, may be recorded to shell history (env: AECLI_WALLET_PASSWORD).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli name full-claim ./wallet.json example-name.chain
```


## pre-claim
```
aecli name pre-claim [options] <wallet_path> <name>
```

Pre-claim an AENS name. The name should be claimed after one key block since the pre-claim gets mined. This command sends a pre-claim transaction, and outputs a salt that needs to be provided to `aecli name claim`. 

A name in arguments should end with ".chain". Be careful, shorter names are more expensive. If the name is shorter than 13 characters (without ".chain") then it won't be claimed immediately but would start an auction instead.

#### Options
`-u, --url [nodeUrl]`  
Node to connect to (default: mainnet, env: AECLI_NODE_URL).  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: 3).  
`-F, --fee [fee]`  
Override the transaction fee.  
`--nonce [nonce]`  
Override the nonce that the transaction is going to be sent with.  
`-P, --password [password]`  
Wallet Password, may be recorded to shell history (env: AECLI_WALLET_PASSWORD).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli name pre-claim ./wallet.json example-name.chain
```


## claim
```
aecli name claim [options] <wallet_path> <name> <salt>
```

Claim an AENS name, it requires a salt provided by `aecli name pre-claim`. 

A name in arguments should end with ".chain". Be careful, shorter names are more expensive. If the name is shorter than 13 characters (without ".chain") then it won't be claimed immediately but would start an auction instead.

#### Options
`--nameFee [nameFee]`  
Amount of coins to pay for name.  
`-u, --url [nodeUrl]`  
Node to connect to (default: mainnet, env: AECLI_NODE_URL).  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: 3).  
`-F, --fee [fee]`  
Override the transaction fee.  
`--nonce [nonce]`  
Override the nonce that the transaction is going to be sent with.  
`-P, --password [password]`  
Wallet Password, may be recorded to shell history (env: AECLI_WALLET_PASSWORD).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli name claim ./wallet.json example-name.chain 12327389123
```


## bid
```
aecli name bid [options] <wallet_path> <name> <nameFee>
```

Bid on name in auction.

#### Arguments
`wallet_path`  
  
`name`  
  
`nameFee`  
Amount of coins to pay for name.  

#### Options
`-u, --url [nodeUrl]`  
Node to connect to (default: mainnet, env: AECLI_NODE_URL).  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: 3).  
`-F, --fee [fee]`  
Override the transaction fee.  
`--nonce [nonce]`  
Override the nonce that the transaction is going to be sent with.  
`-P, --password [password]`  
Wallet Password, may be recorded to shell history (env: AECLI_WALLET_PASSWORD).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli name bid ./wallet.json example-name.chain 4.2ae
```


## update
```
aecli name update [options] <wallet_path> <name> [addresses...]
```

Update a name pointer.

#### Options
`--extendPointers`  
Extend pointers (default: false).  
`--nameTtl [nameTtl]`  
A number of blocks until name expires (default: 180000).  
`--clientTtl [clientTtl]`  
A suggestion measured in seconds on how long clients should cache name pointers (default: 1 hour).  
`-u, --url [nodeUrl]`  
Node to connect to (default: mainnet, env: AECLI_NODE_URL).  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: 3).  
`-F, --fee [fee]`  
Override the transaction fee.  
`--nonce [nonce]`  
Override the nonce that the transaction is going to be sent with.  
`-P, --password [password]`  
Wallet Password, may be recorded to shell history (env: AECLI_WALLET_PASSWORD).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli name update ./wallet.json example-name.chain ct_6y3N9KqQb74QsvR9NrESyhWeLNiA9aJgJ7ua8CvsTuGot6uzh
```


## extend
```
aecli name extend [options] <wallet_path> <name> [nameTtl]
```

Extend name TTL.

#### Arguments
`wallet_path`  
  
`name`  
  
`nameTtl`  
A number of blocks until name expires (default: 180000).  

#### Options
`--clientTtl [clientTtl]`  
A suggestion measured in seconds on how long clients should cache name pointers (default: 1 hour).  
`-u, --url [nodeUrl]`  
Node to connect to (default: mainnet, env: AECLI_NODE_URL).  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: 3).  
`-F, --fee [fee]`  
Override the transaction fee.  
`--nonce [nonce]`  
Override the nonce that the transaction is going to be sent with.  
`-P, --password [password]`  
Wallet Password, may be recorded to shell history (env: AECLI_WALLET_PASSWORD).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli name extend ./wallet.json example-name.chain 180000
```


## revoke
```
aecli name revoke [options] <wallet_path> <name>
```

Revoke an AENS name. After that nobody will be able to claim it again. This action is irreversible!

#### Options
`-u, --url [nodeUrl]`  
Node to connect to (default: mainnet, env: AECLI_NODE_URL).  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: 3).  
`-F, --fee [fee]`  
Override the transaction fee.  
`--nonce [nonce]`  
Override the nonce that the transaction is going to be sent with.  
`-P, --password [password]`  
Wallet Password, may be recorded to shell history (env: AECLI_WALLET_PASSWORD).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli name revoke ./wallet.json example-name.chain
```


## transfer
```
aecli name transfer [options] <wallet_path> <name> <address>
```

Transfer a name to another account.

#### Options
`-u, --url [nodeUrl]`  
Node to connect to (default: mainnet, env: AECLI_NODE_URL).  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: 3).  
`-F, --fee [fee]`  
Override the transaction fee.  
`--nonce [nonce]`  
Override the nonce that the transaction is going to be sent with.  
`-P, --password [password]`  
Wallet Password, may be recorded to shell history (env: AECLI_WALLET_PASSWORD).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli name transfer ./wallet.json example-name.chain ak_21A27UVVt3hDkBE5J7rhhqnH5YNb4Y1dqo4PnSybrH85pnWo7E
```


# contract group


## compile
```
aecli contract compile [options] <file>
```

Compile a contract to get bytecode.

#### Options
`--compilerUrl [compilerUrl]`  
Compiler to connect to (default: stable compiler, env: AECLI_COMPILER_URL).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli contract compile ./contract.aes
```


## encode-calldata
```
aecli contract encode-calldata [options] <fn> [args]
```

Encode calldata for contract call.

#### Arguments
`fn`  
  
`args`  
JSON-encoded arguments array of contract call (default: []).  

#### Options
`-d, --descrPath [descrPath]`  
Path to contract descriptor file.  
`--contractSource [contractSource]`  
Contract source code file name.  
`--contractAci [contractAci]`  
Contract ACI file name.  
`--compilerUrl [compilerUrl]`  
Compiler to connect to (default: stable compiler, env: AECLI_COMPILER_URL).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli contract encode-calldata --descrPath ./contract.aes.deploy.229e.json sum '[1, 2]'
$ aecli contract encode-calldata --contractSource ./contract.aes sum '[1, 2]'
$ aecli contract encode-calldata --contractAci ./contract.json sum '[1, 2]'
```


## decode-call-result
```
aecli contract decode-call-result [options] <fn> <encoded_result>
```

Decode contract call result.

#### Options
`-d, --descrPath [descrPath]`  
Path to contract descriptor file.  
`--contractSource [contractSource]`  
Contract source code file name.  
`--contractAci [contractAci]`  
Contract ACI file name.  
`--compilerUrl [compilerUrl]`  
Compiler to connect to (default: stable compiler, env: AECLI_COMPILER_URL).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli contract decode-call-result --descrPath ./contract.aes.deploy.229e.json test cb_DA6sWJo=
$ aecli contract decode-call-result --contractSource ./contract.aes test cb_DA6sWJo=
$ aecli contract decode-call-result --contractAci ./contract.json test cb_DA6sWJo=
```


## call
```
aecli contract call [options] <fn> [args] [wallet_path]
```

Execute a function of the contract.

#### Arguments
`fn`  
Name of contract entrypoint to call.  
`args`  
JSON-encoded arguments array of contract call (default: []).  
`wallet_path`  
Path to secret storage file, not needed to make a static call.  

#### Options
`--contractAddress [contractAddress]`  
Contract address to call.  
`-s, --callStatic`  
Estimate the return value, without making a transaction on chain.  
`-t, --topHash`  
Hash of block to make call.  
`-d, --descrPath [descrPath]`  
Path to contract descriptor file.  
`--contractSource [contractSource]`  
Contract source code file name.  
`--contractAci [contractAci]`  
Contract ACI file name.  
`-u, --url [nodeUrl]`  
Node to connect to (default: mainnet, env: AECLI_NODE_URL).  
`-P, --password [password]`  
Wallet Password, may be recorded to shell history (env: AECLI_WALLET_PASSWORD).  
`-G, --gas [gas]`  
Amount of gas to call/deploy the contract.  
`--gasPrice [gasPrice]`  
Gas price to call/deploy the contract (default: based on network demand).  
`-N, --nonce [nonce]`  
Override the nonce that the transaction is going to be sent with.  
`-a, --amount [amount]`  
Amount of coins to send (default: 0ae).  
`-F, --fee [fee]`  
Override the transaction fee.  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: 3).  
`--compilerUrl [compilerUrl]`  
Compiler to connect to (default: stable compiler, env: AECLI_COMPILER_URL).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli contract call ./wallet.json sum '[1, 2]' --descrPath ./contract.aes.deploy.229e.json
$ aecli contract call ./wallet.json sum '[1, 2]' --contractAddress ct_6y3N9KqQb74QsvR9NrESyhWeLNiA9aJgJ7ua8CvsTuGot6uzh --callStatic
$ aecli contract call ./wallet.json sum '[1, 2]' --descrPath ./contract.aes.deploy.229e.json --gas 2222222 --nonce 4 --ttl 1243
```


## deploy
```
aecli contract deploy [options] <wallet_path> [args]
```

Deploy a contract on the chain and create a deployment descriptor with the contract information that can be used to invoke the contract later on. The generated descriptor will be made in the same folder of the contract source file or at the location provided in `descrPath`. Multiple deploys of the same contract file will generate different deploy descriptors.

#### Arguments
`wallet_path`  
  
`args`  
JSON-encoded arguments array of contract call (default: []).  

#### Options
`--contractBytecode [contractBytecode]`  
Contract bytecode file name.  
`-d, --descrPath [descrPath]`  
Path to contract descriptor file.  
`--contractSource [contractSource]`  
Contract source code file name.  
`--contractAci [contractAci]`  
Contract ACI file name.  
`-u, --url [nodeUrl]`  
Node to connect to (default: mainnet, env: AECLI_NODE_URL).  
`-P, --password [password]`  
Wallet Password, may be recorded to shell history (env: AECLI_WALLET_PASSWORD).  
`-G, --gas [gas]`  
Amount of gas to call/deploy the contract.  
`--gasPrice [gasPrice]`  
Gas price to call/deploy the contract (default: based on network demand).  
`-N, --nonce [nonce]`  
Override the nonce that the transaction is going to be sent with.  
`-a, --amount [amount]`  
Amount of coins to send (default: 0ae).  
`-F, --fee [fee]`  
Override the transaction fee.  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: 3).  
`--compilerUrl [compilerUrl]`  
Compiler to connect to (default: stable compiler, env: AECLI_COMPILER_URL).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli contract deploy ./wallet.json --contractSource ./contract.aes '[1, 2]'
$ aecli contract deploy ./wallet.json --descrPath ./contract.aes.deploy.229e.json --gas 2222222
$ aecli contract deploy ./wallet.json --contractBytecode ./contract.txt --contractAci ./contract.json
```


# oracle group


## get
```
aecli oracle get [options] <oracleId>
```

Print oracle details.

#### Options
`-u, --url [nodeUrl]`  
Node to connect to (default: mainnet, env: AECLI_NODE_URL).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli oracle get ok_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi
```


## create
```
aecli oracle create [options] <wallet_path> <queryFormat> <responseFormat>
```

Register current account as oracle.

#### Options
`--oracleTtl [oracleTtl]`  
Relative oracle time to leave (default: 500).  
`--queryFee [queryFee]`  
Oracle query fee (default: 0).  
`-P, --password [password]`  
Wallet Password, may be recorded to shell history (env: AECLI_WALLET_PASSWORD).  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: 3).  
`-F, --fee [fee]`  
Override the transaction fee.  
`--nonce [nonce]`  
Override the nonce that the transaction is going to be sent with.  
`-u, --url [nodeUrl]`  
Node to connect to (default: mainnet, env: AECLI_NODE_URL).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli oracle create ./wallet.json string string
```


## extend
```
aecli oracle extend [options] <wallet_path> <oracleTtl>
```

Extend oracle's time to leave.

#### Options
`-P, --password [password]`  
Wallet Password, may be recorded to shell history (env: AECLI_WALLET_PASSWORD).  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: 3).  
`-F, --fee [fee]`  
Override the transaction fee.  
`--nonce [nonce]`  
Override the nonce that the transaction is going to be sent with.  
`-u, --url [nodeUrl]`  
Node to connect to (default: mainnet, env: AECLI_NODE_URL).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli oracle extend ./wallet.json 200
```


## create-query
```
aecli oracle create-query [options] <wallet_path> <oracleId> <query>
```

Create an oracle query.

#### Options
`--responseTtl [responseTtl]`  
Relative query response time to leave (default: 10).  
`--queryTtl [queryTtl]`  
Relative query time to leave (default: 10).  
`--queryFee [queryFee]`  
Oracle query fee (default: 0).  
`-P, --password [password]`  
Wallet Password, may be recorded to shell history (env: AECLI_WALLET_PASSWORD).  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: 3).  
`-F, --fee [fee]`  
Override the transaction fee.  
`--nonce [nonce]`  
Override the nonce that the transaction is going to be sent with.  
`-u, --url [nodeUrl]`  
Node to connect to (default: mainnet, env: AECLI_NODE_URL).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli oracle create-query ./wallet.json ok_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi WhatTheWeatherIs?
```


## respond-query
```
aecli oracle respond-query [options] <wallet_path> <queryId> <response>
```

Respond to an oracle query.

#### Options
`--responseTtl [responseTtl]`  
Query response time to leave (default: 10).  
`-P, --password [password]`  
Wallet Password, may be recorded to shell history (env: AECLI_WALLET_PASSWORD).  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: 3).  
`-F, --fee [fee]`  
Override the transaction fee.  
`--nonce [nonce]`  
Override the nonce that the transaction is going to be sent with.  
`-u, --url [nodeUrl]`  
Node to connect to (default: mainnet, env: AECLI_NODE_URL).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli oracle respond-query ./wallet.json oq_6y3N9KqQb74QsvR9NrESyhWeLNiA9aJgJ7ua8CvsTuGot6uzh +16Degree
```


# chain group


## top
```
aecli chain top [options]
```

Query the top key/micro block of the chain.

#### Options
`-u, --url [nodeUrl]`  
Node to connect to (default: mainnet, env: AECLI_NODE_URL).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli chain top 
```


## status
```
aecli chain status [options]
```

Query node version, network id, and related details of the selected node.

#### Options
`-u, --url [nodeUrl]`  
Node to connect to (default: mainnet, env: AECLI_NODE_URL).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli chain status 
```


## ttl
```
aecli chain ttl [options] <absoluteTtl>
```

Get relative TTL by absolute TTL.

#### Options
`-u, --url [nodeUrl]`  
Node to connect to (default: mainnet, env: AECLI_NODE_URL).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli chain ttl 
```


## play
```
aecli chain play [options]
```

Prints blocks from top until condition.

#### Options
`-L, --limit [playLimit]`  
Amount of blocks to print (default: 10).  
`-P, --height [playToHeight]`  
Print blocks till the height.  
`-u, --url [nodeUrl]`  
Node to connect to (default: mainnet, env: AECLI_NODE_URL).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli chain play --limit 3  # print 3 blocks from top
$ aecli chain play --height 929796  # print blocks from top until reach height
```


## broadcast
```
aecli chain broadcast [options] <tx>
```

Send signed transaction to the chain. Useful in offline signing scheme.

#### Options
`-W, --no-waitMined`  
Don't wait until transaction gets mined.  
`--verify`  
Verify Transaction before broadcasting.  
`-u, --url [nodeUrl]`  
Node to connect to (default: mainnet, env: AECLI_NODE_URL).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli chain broadcast tx_+FoMAaEBzqet5HDJ+Z2dTkAIgKhvHUm7REti8Rqeu2S7z+tz/vOhARX7Ovvi4N8rfRN/Dsvb2ei7AJ3ysIkBrG5pnY6qW3W7iQVrx14tYxAAAIYPUN430AAAKoBebL57
```


## inspect
```
aecli inspect [options] <identifier>
```

Prints details of:
  - account (ak_-prefixed string),
  - name (string ending with '.chain'),
  - contract (ct_-prefixed string),
  - oracle (ok_-prefixed string),
  - keyblock or microblock (prefixed with kh_, mh_),
  - keyblock by height (integer),
  - transaction (by th_-string or tx_).

#### Options
`-u, --url [nodeUrl]`  
Node to connect to (default: mainnet, env: AECLI_NODE_URL).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli inspect ak_21A27UVVt3hDkBE5J7rhhqnH5YNb4Y1dqo4PnSybrH85pnWo7E  # get account details
$ aecli inspect example-name.chain  # get details of AENS name
$ aecli inspect ct_6y3N9KqQb74QsvR9NrESyhWeLNiA9aJgJ7ua8CvsTuGot6uzh  # get contract details
$ aecli inspect ok_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi  # get contract details
$ aecli inspect kh_CF37tA4KiiZTFqbQ6JFCU7kDt6CBZucBrvineVUGC7svA9vK7  # get key block details by hash
$ aecli inspect mh_k1K9gLLtdikJhCdKfBbhYGveQs7osSNwceEJZb1jD6AmraNdr  # get micro block details by hash
$ aecli inspect 929796  # get key block details by height
$ aecli inspect th_2nZshewM7FtKSsDEP4zXPsGCe9cdxaFTRrcNjJyE22ktjGidZR  # get transaction details by hash
$ aecli inspect tx_+FoMAaEBzqet5HDJ+Z2dTkAIgKhvHUm7REti8Rqeu2S7z+tz/vOhARX7Ovvi4N8rfRN/Dsvb2ei7AJ3ysIkBrG5pnY6qW3W7iQVrx14tYxAAAIYPUN430AAAKoBebL57  # get transaction details
```


# tx group


## spend
```
aecli tx spend [options] <senderId> <receiverId> <amount> <nonce>
```

Build spend transaction.

#### Arguments
`senderId`  
  
`receiverId`  
  
`amount`  
Amount of coins to send.  
`nonce`  
Unique number that is required to sign transaction securely.  

#### Options
`--payload [payload]`  
Transaction payload (default: "").  
`-F, --fee [fee]`  
Override the transaction fee.  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: undefined).  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli tx spend ak_21A27UVVt3hDkBE5J7rhhqnH5YNb4Y1dqo4PnSybrH85pnWo7E ak_AgV756Vfo99juwzNVgnjP1gXX1op1QN3NXTxvkPnHJPUDE8NT 100ae 42
```


## name-preclaim
```
aecli tx name-preclaim [options] <accountId> <name> <nonce>
```

Build name preclaim transaction.

#### Arguments
`accountId`  
  
`name`  
  
`nonce`  
Unique number that is required to sign transaction securely.  

#### Options
`-F, --fee [fee]`  
Override the transaction fee.  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: undefined).  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli tx name-preclaim ak_21A27UVVt3hDkBE5J7rhhqnH5YNb4Y1dqo4PnSybrH85pnWo7E example-name.chain 42
```


## name-claim
```
aecli tx name-claim [options] <accountId> <salt> <name> <nonce>
```

Build name claim transaction.

#### Arguments
`accountId`  
  
`salt`  
  
`name`  
  
`nonce`  
Unique number that is required to sign transaction securely.  

#### Options
`--nameFee [nameFee]`  
Name fee.  
`-F, --fee [fee]`  
Override the transaction fee.  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: undefined).  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli tx name-claim ak_21A27UVVt3hDkBE5J7rhhqnH5YNb4Y1dqo4PnSybrH85pnWo7E 12327389123 example-name.chain 42
```


## name-update
```
aecli tx name-update [options] <accountId> <nameId> <nonce> [pointers...]
```

Build name update transaction.

#### Arguments
`accountId`  
  
`nameId`  
  
`nonce`  
Unique number that is required to sign transaction securely.  
`pointers`  
  

#### Options
`--nameTtl [nameTtl]`  
Validity of name (default: 180000).  
`--clientTtl [clientTtl]`  
A suggestion measured in seconds on how long clients should cache name pointers (default: 1 hour).  
`-F, --fee [fee]`  
Override the transaction fee.  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: undefined).  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli tx name-update ak_21A27UVVt3hDkBE5J7rhhqnH5YNb4Y1dqo4PnSybrH85pnWo7E example-name.chain 42 ct_6y3N9KqQb74QsvR9NrESyhWeLNiA9aJgJ7ua8CvsTuGot6uzh
```


## name-transfer
```
aecli tx name-transfer [options] <accountId> <recipientId> <name> <nonce>
```

Build name transfer transaction.

#### Arguments
`accountId`  
  
`recipientId`  
  
`name`  
  
`nonce`  
Unique number that is required to sign transaction securely.  

#### Options
`-F, --fee [fee]`  
Override the transaction fee.  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: undefined).  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli tx name-transfer ak_21A27UVVt3hDkBE5J7rhhqnH5YNb4Y1dqo4PnSybrH85pnWo7E ak_AgV756Vfo99juwzNVgnjP1gXX1op1QN3NXTxvkPnHJPUDE8NT example-name.chain 42
```


## name-revoke
```
aecli tx name-revoke [options] <accountId> <name> <nonce>
```

Build name revoke transaction.

#### Arguments
`accountId`  
  
`name`  
  
`nonce`  
Unique number that is required to sign transaction securely.  

#### Options
`-F, --fee [fee]`  
Override the transaction fee.  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: undefined).  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli tx name-revoke ak_21A27UVVt3hDkBE5J7rhhqnH5YNb4Y1dqo4PnSybrH85pnWo7E example-name.chain 42
```


## contract-deploy
```
aecli tx contract-deploy [options] <ownerId> <contractBytecode> <initCallData> <nonce>
```

Build contract deploy transaction.

#### Arguments
`ownerId`  
  
`contractBytecode`  
  
`initCallData`  
  
`nonce`  
Unique number that is required to sign transaction securely.  

#### Options
`-G, --gas [gas]`  
Amount of gas to call/deploy the contract.  
`--gasPrice [gasPrice]`  
Gas price to call/deploy the contract (default: 1000000000).  
`-a, --amount [amount]`  
Amount of coins to send (default: 0ae).  
`-F, --fee [fee]`  
Override the transaction fee.  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: undefined).  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli tx contract-deploy ak_21A27UVVt3hDkBE5J7rhhqnH5YNb4Y1dqo4PnSybrH85pnWo7E cb_dGhpcyBtZXNzYWdlIGlzIG5vdCBpbmRleGVkdWmUpw== cb_DA6sWJo= 42
```


## contract-call
```
aecli tx contract-call [options] <callerId> <contractId> <callData> <nonce>
```

Build contract call transaction.

#### Arguments
`callerId`  
  
`contractId`  
  
`callData`  
  
`nonce`  
Unique number that is required to sign transaction securely.  

#### Options
`-G, --gas [gas]`  
Amount of gas to call/deploy the contract.  
`--gasPrice [gasPrice]`  
Gas price to call/deploy the contract (default: 1000000000).  
`-a, --amount [amount]`  
Amount of coins to send (default: 0ae).  
`-F, --fee [fee]`  
Override the transaction fee.  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: undefined).  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli tx contract-call ak_21A27UVVt3hDkBE5J7rhhqnH5YNb4Y1dqo4PnSybrH85pnWo7E ct_6y3N9KqQb74QsvR9NrESyhWeLNiA9aJgJ7ua8CvsTuGot6uzh cb_DA6sWJo= 42
```


## oracle-register
```
aecli tx oracle-register [options] <accountId> <queryFormat> <responseFormat> <nonce>
```

Build oracle register transaction.

#### Arguments
`accountId`  
  
`queryFormat`  
  
`responseFormat`  
  
`nonce`  
Unique number that is required to sign transaction securely.  

#### Options
`--queryFee [queryFee]`  
Oracle query fee (default: 0).  
`--oracleTtl [oracleTtl]`  
Oracle TTL (default: 500).  
`-F, --fee [fee]`  
Override the transaction fee.  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: undefined).  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli tx oracle-register ak_21A27UVVt3hDkBE5J7rhhqnH5YNb4Y1dqo4PnSybrH85pnWo7E '{"city": "string"}' '{"tmp": "number"}' 42
```


## oracle-extend
```
aecli tx oracle-extend [options] <oracleId> <oracleTtl> <nonce>
```

Build oracle extend transaction.

#### Arguments
`oracleId`  
  
`oracleTtl`  
  
`nonce`  
Unique number that is required to sign transaction securely.  

#### Options
`-F, --fee [fee]`  
Override the transaction fee.  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: undefined).  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli tx oracle-extend ok_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi 100 42
```


## oracle-post-query
```
aecli tx oracle-post-query [options] <accountId> <oracleId> <query> <nonce>
```

Build oracle post query transaction.

#### Arguments
`accountId`  
  
`oracleId`  
  
`query`  
  
`nonce`  
Unique number that is required to sign transaction securely.  

#### Options
`--queryFee [queryFee]`  
Oracle query fee (default: 0).  
`--queryTtl [oracleTtl]`  
Oracle TTL (default: 10).  
`--responseTtl [oracleTtl]`  
Oracle TTL (default: 10).  
`-F, --fee [fee]`  
Override the transaction fee.  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: undefined).  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli tx oracle-post-query ak_AgV756Vfo99juwzNVgnjP1gXX1op1QN3NXTxvkPnHJPUDE8NT ok_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi '{"city": "Berlin"}' 42
```


## oracle-respond
```
aecli tx oracle-respond [options] <oracleId> <queryId> <response> <nonce>
```

Build oracle respond transaction.

#### Arguments
`oracleId`  
  
`queryId`  
  
`response`  
  
`nonce`  
Unique number that is required to sign transaction securely.  

#### Options
`--responseTtl [oracleTtl]`  
Oracle TTL (default: 10).  
`-F, --fee [fee]`  
Override the transaction fee.  
`-T, --ttl [ttl]`  
Validity of the transaction in number of keyblocks, or without this limit if 0 (default: undefined).  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli tx oracle-respond ok_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi oq_6y3N9KqQb74QsvR9NrESyhWeLNiA9aJgJ7ua8CvsTuGot6uzh '{"tmp": 1}' 42
```


## verify
```
aecli tx verify [options] <tx>
```

Verify transaction using node.

#### Options
`-u, --url [nodeUrl]`  
Node to connect to (default: mainnet, env: AECLI_NODE_URL).  
`-f, --force`  
Ignore node version compatibility check.  
`--json`  
Print result in json format.  

#### Example calls
```
$ aecli tx verify tx_+FoMAaEBzqet5HDJ+Z2dTkAIgKhvHUm7REti8Rqeu2S7z+tz/vOhARX7Ovvi4N8rfRN/Dsvb2ei7AJ3ysIkBrG5pnY6qW3W7iQVrx14tYxAAAIYPUN430AAAKoBebL57
```


## config
```
aecli config [options]
```

Print the current sdk configuration.

#### Options
`-u, --url [nodeUrl]`  
Node to connect to (default: mainnet, env: AECLI_NODE_URL).  
`--compilerUrl [compilerUrl]`  
Compiler to connect to (default: stable compiler, env: AECLI_COMPILER_URL).  


## select-node
```
aecli select-node [options] [nodeUrl]
```

Specify node to use in other commands.

#### Arguments
`nodeUrl`  
Node URL.  


## select-compiler
```
aecli select-compiler [options] [compilerUrl]
```

Specify compiler to use in other commands.

#### Arguments
`compilerUrl`  
Compiler URL.  