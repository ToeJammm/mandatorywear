import Shippo from "shippo";

let _shippo: Shippo | null = null;

export function getShippo(): Shippo {
  if (!_shippo) {
    _shippo = new Shippo({ apiKeyHeader: process.env.SHIPPO_API_KEY! });
  }
  return _shippo;
}
