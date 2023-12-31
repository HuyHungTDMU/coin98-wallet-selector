export const chainsUseAddress: string[] = ['cosmos', 'evm', 'near'];

export enum BLOCKCHAINS_DATA {
  ethereum = 'evm',
  solana = 'solana',
  cosmos = 'cosmos',
  near = 'near',
}

export enum CHAINS_ID {
  solana = 'solana', //

  //cosmos
  chihuahua = 'chihuahua-1',
  '8ball' = 'eightball-1',
  acrechain = 'acre_9052-1',
  agoric = 'agoric-3',
  aioz = 'aioz_168-1',
  akash = 'akashnet-2',
  arkh = 'arkh',
  assetmantle = 'mantle-1',
  aura = 'xstaxy-1',
  axelar = 'axelar-dojo-1',
  bandchain = 'laozi-mainnet',
  beezee = 'beezee-1',
  bitcanna = 'bitcanna-1',
  bitsong = 'bitsong-2b',
  bluzelle = 'bluzelle-9',
  bostrom = 'bostrom',
  canto = 'canto_7700-1',
  carbon = 'carbon-1',
  cerberus = 'cerberus-chain-1',
  chain4energy = 'perun-1',
  cheqd = 'cheqd-mainnet-1',
  chimba = 'chimba',
  chronicnetwork = 'morocco-1',
  comdex = 'comdex-1',
  commercionetwork = 'commercio-3',
  coreum = 'coreum-mainnet-1',
  cosmoshub = 'cosmoshub-4',
  crescent = 'crescent-1',
  cronos = 'cronosmainnet_25-1',
  cryptoorgchain = 'crypto-org-chain-mainnet-1',
  cudos = 'cudos-1',
  decentr = 'mainnet-3',
  desmos = 'desmos-mainnet',
  dig = 'dig-1',
  dyson = 'dyson-mainnet-01',
  echelon = 'echelon_3000-3',
  emoney = 'emoney-3',
  ethos = 'ethos_7003-1',
  evmos = 'evmos_9001-2',
  fetchhub = 'fetchhub-4',
  firmachain = 'colosseum-1',
  galaxy = 'galaxy-1',
  genesisl1 = 'genesis_29-2',
  gitopia = 'gitopia',
  gravitybridge = 'gravity-bridge-3',
  idep = 'Antora',
  impacthub = 'ixo-5',
  imversed = 'imversed_5555555-1',
  injective = 'injective-1',
  irisnet = 'irishub-1',
  jackal = 'jackal-1',
  juno = 'juno-1',
  kava = 'kava_2222-10',
  kichain = 'kichain-2',
  konstellation = 'darchub',
  kujira = 'kaiyo-1',
  kyve = 'kyve-1',
  lambda = 'lambda_92000-1',
  likecoin = 'likecoin-mainnet-2',
  logos = 'logos_7002-1',
  loyal = 'loyal-main-02',
  lumenx = 'LumenX',
  lumnetwork = 'lum-network-1',
  mars = 'mars-1',
  mayachain = 'mayachain-mainnet-v1',
  medasdigital = 'medasdigital-1',
  meme = 'meme-1',
  microtick = 'microtick-1',
  migaloo = 'migaloo-1',
  mises = 'mainnet',
  mythos = 'mythos_7001-1',
  neutron = 'neutron-1',
  noble = 'noble-1',
  nois = 'nois-1',
  nomic = 'nomic-stakenet-3',
  nyx = 'nyx',
  octa = 'octa',
  odin = 'odin-mainnet-freya',
  okexchain = 'exchain-66',
  omniflixhub = 'omniflixhub-1',
  onomy = 'onomy-mainnet-1',
  oraichain = 'Oraichain',
  osmosis = 'osmosis-1',
  panacea = 'panacea-3',
  passage = 'passage-1',
  persistence = 'core-1',
  planq = 'planq_7070-2',
  point = 'point_10687-1',
  provenance = 'pio-mainnet-1',
  quasar = 'quasar-1',
  quicksilver = 'quicksilver-2',
  realio = 'realionetwork_3301-1',
  rebus = 'reb_1111-1',
  regen = 'regen-1',
  rizon = 'titan-1',
  secretnetwork = 'secret-4',
  sentinel = 'sentinelhub-2',
  shareledger = 'ShareRing-VoyagerNet',
  shentu = 'shentu-2.2',
  sifchain = 'sifchain-1',
  sommelier = 'sommelier-3',
  stafihub = 'stafihub-1',
  stargaze = 'stargaze-1',
  starname = 'iov-mainnet-ibc',
  stride = 'stride-1',
  teritori = 'teritori-1',
  terpnetwork = 'morocco-1',
  terra = 'columbus-5',
  terra2 = 'phoenix-1',
  akashtestnet = 'sandbox-01',
  archwaytestnet = 'constantine-2',
  axelartestnet = 'axelar-testnet-lisbon-3',
  babylontestnet = 'bbn-test1',
  bitcannadevnet = 'bitcanna-dev-1',
  bitcannadevnet2 = 'bitcanna-dev-6',
  cascadiatestnet = 'cascadia_6102-1',
  celestiatestnet = 'blockspacerace-0',
  celestiatestnet2 = 'arabica-5',
  celestiatestnet3 = 'mocha',
  cheqdtestnet = 'cheqd-testnet-6',
  chimbatestnet = 'chimba-testnet',
  composabletestnet = 'banksy-testnet-2',
  coolcattestnet = 'kitten-04',
  coreumtestnet = 'coreum-testnet-1',
  cosmoshubtestnet = 'theta-testnet-001',
  cosmwasmtestnet = 'malaga-420',
  cudostestnet = 'cudos-testnet-public-3',
  elystestnet = 'elystestnet-1',
  empowertestnet = 'altruistic-1',
  evmostestnet = 'evmos_9000-4',
  fetchhubtestnet = 'dorado-1',
  gitopiatestnet = 'gitopia-janus-testnet-2',
  humanstestnet = 'testnet-1',
  hypersigntestnet = 'jagrat',
  impacthubdevnet = 'devnet-1',
  impacthubtestnet = 'pandora-8',
  imversedtestnet = 'imversed-test-1',
  injectivetestnet = 'injective-888',
  jackaltestnet = 'canine-1',
  junotestnet = 'uni-6',
  kichaintestnet = 'kichain-t-4',
  kujiratestnet = 'harpoon-4',
  kyvedevnet = 'korellia',
  kyvetestnet = 'kaon-1',
  lumenxtestnet = 'lumenx-test',
  marstestnet = 'ares-1',
  migalootestnet = 'narwhal-1',
  neutrontestnet = 'pion-1',
  nobltestnet = 'grand-1',
  noistestnet = 'nois-testnet-005',
  nolustestnet = 'nolus-rila',
  osmosistestnet = 'osmo-test-4',
  osmosistestnet5 = 'osmo-test-5',
  persistencetestnet = 'test-core-1',
  quasartestnet = 'qsr-questnet-04',
  quicksilvertestnet = 'rhye-1',
  qwoyntestnet = 'higgs-boson-1',
  saagetestnet = 'saage-internal-testnet-1.3',
  secretnetworktestnet = 'pulsar-2',
  seidevnet3 = 'sei-devnet-3',
  seitestnet = 'atlantic-1',
  seitestnet2 = 'atlantic-2',
  sixtestnet = 'fivenet',
  sourcetestnet = 'source-testnet',
  stargazetestnet = 'elgafar-1',
  statesettestnet = 'stateset-1-testnet',
  stridetestnet = 'stride-testnet-1',
  terpnettestnet = 'athena-4',
  terra2testnet = 'pisco-1',
  ulastestnet = 'ulas',
  tgrade = 'tgrade-mainnet-1',
  thorchain = 'thorchain-mainnet-v1',
  umee = 'umee-1',
  unification = 'FUND-MainNet-2',
  uptick = 'uptick_117-1',
  vidulum = 'vidulum-1',
  vincechain = 'vince_1000-1',
  xpla = 'dimension_37-1',

  //evm
  binanceSmart = '0x38',
  ether = '0x1',
  etherPoW = '0x2711',
  heco = '0x80',
  okex = '0x42',
  gate = '0x56',
  kucoin = '0x141',
  avax = '0xa86a',
  matic = '0x89',
  fantom = '0xfa',
  xDai = '0x64',
  viction = '0x58',
  kardia = '0x18',
  ronin = '0x7e4',
  celo = '0xA4EC',
  klaytn = '0x2019',
  harmony = '0x63564C40',
  optimism = '0xA',
  arbitrum = '0xa4b1',
  boba = '0x120',
  aurora = '0x4e454152',
  platon = '0x335F9',
  cronoscosmos = '0x19',
  bittorrent = '0xc7',
  thetaFuel = '0x169',
  moonbeam = '0x504',
  oasis = '0xa516',
  zkSyncPolygon = '0x44D',
  zkSyncEra = '0x144',

  binanceSmartTest = '0x61',

  //near
  nearmainnet = 'near-mainnet',
  neartestnet = 'near-testnet',
}

export enum WALLETS_NAME {
  coin98Ether = 'coin98_ether',
  coin98Cosmos = 'coin98_cosmos',
  coin98Solana = 'coin98_solana',
  coin98Near = 'coin98_near',
  metamask = 'metamask_ether',
  phantom = 'phantom_solana',
  fin = 'fin_cosmos',
  keplr = 'keplr_cosmos',
  leap = 'leap_cosmos',
  compass = 'compass_cosmos',
}
