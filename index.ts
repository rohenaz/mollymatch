import express from "express";
import {
	createOrdinals,
	fetchPayUtxos,
} from "js-1sat-ord";
import { PrivateKey } from "@bsv/sdk";
import type { CreateOrdinalsConfig } from "js-1sat-ord/dist/createOrdinals";
import { config } from 'dotenv'
config()

const app = express();
const PORT: number = 3000;

// Ensure PAYMENT_WIF is provided
if (!process.env.PAYMENT_WIF) {
  console.error("No WIF provided in .env file");
  process.exit(1);
}

// Handling GET / Request
app.get("/", async (req, res) => {
	const address = "156udJ16k85DtgepkH2K1Eubp3UhH3ru97";
	const ordAddress = "18jGFfSb32rBAPvkHdabBHCTsNCKwxTm1Y";
  const paymentWif = process.env.PAYMENT_WIF as string;
  const paymentPk = PrivateKey.fromWif(paymentWif);

	const utxos = await fetchPayUtxos(address);

  console.log({ utxos });

	// inscription
	const dataB64 = Buffer.from("MollyMatch Rocks").toString("base64");
	const inscription = { dataB64, contentType: "text/plain" };

	console.log("Making ordinal itself (createOrdinal)");

	const config: CreateOrdinalsConfig = {
		utxos,
		paymentPk,
		destinations: [
			{
				address: ordAddress,
				inscription,
			},
		],
	};

  try {
    const { tx } = await createOrdinals(config);
    console.log({ tx: tx.toHex() });
    res.send(`Generated Ordinal Transaction: ${tx.toHex()}`);
  } catch (e) {
    console.error(e);
    if (isError(e)) {
      res.send(`Error: ${e.message}`);
    } else {
      res.send('An unknown error occurred');
    }
  }
});

function isError(error: unknown): error is Error {
  return error instanceof Error;
}

// Server setup
app.listen(PORT, () => {
	console.log(
		`The application is listening on port http://localhost:${PORT}`,
	);
});
