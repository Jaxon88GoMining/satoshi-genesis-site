import { NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';

export const dynamic = 'force-dynamic';

const SGEN_MINT = 'DLftpBQXTvKgBAtqHbkk8sKtvCsT5WR7Ws3ULdFvjmyF';
const FALLBACK_DECIMALS = 8;
const RPC_ENDPOINTS = [
  process.env.SOLANA_RPC_URL,
  'https://solana-rpc.publicnode.com',
  'https://api.mainnet-beta.solana.com',
  'https://rpc.ankr.com/solana',
].filter(Boolean) as string[];

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPF5y9wKNvEdfhHjcvTY');
const TOKEN_PROGRAM_IDS = [
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
];

function formatTokenAmount(rawAmount: bigint, decimals: number) {
  if (rawAmount === BigInt(0)) return '0';

  const padded = rawAmount.toString().padStart(decimals + 1, '0');
  const whole = padded.slice(0, -decimals) || '0';
  const fraction = padded.slice(-decimals).replace(/0+$/, '');

  return fraction ? `${whole}.${fraction}` : whole;
}

function readTokenAccountAmount(data: Uint8Array) {
  const view = new DataView(data.buffer as ArrayBuffer, data.byteOffset, data.byteLength);
  return view.getBigUint64(64, true);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown RPC error';
}

async function getMintDecimals(connection: Connection, mint: PublicKey) {
  try {
    const supply = await connection.getTokenSupply(mint, 'confirmed');
    return supply.value.decimals;
  } catch {
    return FALLBACK_DECIMALS;
  }
}

async function getMintTokenProgramId(connection: Connection, mint: PublicKey) {
  const mintAccount = await connection.getAccountInfo(mint, 'confirmed');

  if (!mintAccount) {
    throw new Error('SGEN mint account was not found on this RPC endpoint.');
  }

  const tokenProgramId = TOKEN_PROGRAM_IDS.find((programId) => programId.equals(mintAccount.owner));

  if (!tokenProgramId) {
    throw new Error(`SGEN mint is owned by an unsupported program: ${mintAccount.owner.toBase58()}`);
  }

  return tokenProgramId;
}

async function getSgenRawBalanceFromEndpoint(endpoint: string, owner: PublicKey) {
  const connection = new Connection(endpoint, 'confirmed');
  const sgenMint = new PublicKey(SGEN_MINT);
  const tokenProgramId = await getMintTokenProgramId(connection, sgenMint);
  let rawBalance = BigInt(0);

  const tokenAccounts = await connection.getTokenAccountsByOwner(owner, { programId: tokenProgramId }, 'confirmed');

  for (const account of tokenAccounts.value) {
    const data = account.account.data;
    if (data.length < 72) continue;

    const accountMint = new PublicKey(data.subarray(0, 32));
    if (!accountMint.equals(sgenMint)) continue;

    rawBalance += readTokenAccountAmount(data);
  }

  const decimals = await getMintDecimals(connection, sgenMint);
  return { decimals, rawBalance, tokenProgram: tokenProgramId.toBase58() };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('wallet')?.trim();

  if (!walletAddress) {
    return NextResponse.json({ error: 'Wallet address is required.' }, { status: 400 });
  }

  let owner: PublicKey;
  try {
    owner = new PublicKey(walletAddress);
  } catch {
    return NextResponse.json({ error: 'Invalid wallet address.' }, { status: 400 });
  }

  let lastError = 'No RPC endpoint was available.';

  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const { decimals, rawBalance, tokenProgram } = await getSgenRawBalanceFromEndpoint(endpoint, owner);

      return NextResponse.json(
        {
          balance: formatTokenAmount(rawBalance, decimals),
          hasSgen: rawBalance > BigInt(0),
          mint: SGEN_MINT,
          rawBalance: rawBalance.toString(),
          tokenProgram,
          wallet: owner.toBase58(),
        },
        {
          headers: {
            'Cache-Control': 'no-store',
          },
        },
      );
    } catch (error) {
      lastError = getErrorMessage(error);
    }
  }

  return NextResponse.json(
    {
      error: `Unable to check SGEN balance right now. RPC access failed: ${lastError}`,
    },
    { status: 502 },
  );
}
