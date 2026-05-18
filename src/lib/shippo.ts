import Shippo from "shippo";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _shippo: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getShippo(): any {
  if (!_shippo) {
    _shippo = new (Shippo as any)({ apiKeyHeader: process.env.SHIPPO_API_KEY! });
  }
  return _shippo;
}
