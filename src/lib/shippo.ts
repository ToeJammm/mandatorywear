import Shippo from "shippo";

type ShippoClient = InstanceType<typeof Shippo>;

let _shippo: ShippoClient | null = null;

export function getShippo(): ShippoClient {
  if (!_shippo) {
    _shippo = new Shippo({ apiKeyHeader: process.env.SHIPPO_API_KEY! });
  }
  return _shippo;
}
