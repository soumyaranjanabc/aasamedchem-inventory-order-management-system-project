import type { BaseUnit, UnitDimension } from "@/lib/db/schema";

export type UnitDefinition = {
  symbol: string;
  name: string;
  dimension: UnitDimension;
  toBaseFactor: string;
};

export const DEFAULT_UNITS: UnitDefinition[] = [
  { symbol: "g", name: "Grams", dimension: "weight", toBaseFactor: "1" },
  { symbol: "kg", name: "Kilograms", dimension: "weight", toBaseFactor: "1000" },
  { symbol: "mL", name: "Milliliters", dimension: "volume", toBaseFactor: "1" },
  { symbol: "L", name: "Liters", dimension: "volume", toBaseFactor: "1000" },
  { symbol: "unit", name: "Unit", dimension: "count", toBaseFactor: "1" },
];

export function baseUnitDimension(baseUnit: BaseUnit): UnitDimension {
  if (baseUnit === "g") return "weight";
  if (baseUnit === "mL") return "volume";
  return "count";
}

export function compatibleUnits(baseUnit: BaseUnit) {
  const dimension = baseUnitDimension(baseUnit);
  return DEFAULT_UNITS.filter((unit) => unit.dimension === dimension);
}

export function convertToBase(orderedQty: number, orderedUnit: string) {
  const unit = DEFAULT_UNITS.find((item) => item.symbol === orderedUnit);
  if (!unit) {
    throw new Error(`Unknown unit: ${orderedUnit}`);
  }

  return orderedQty * Number(unit.toBaseFactor);
}

export function formatQuantity(quantity: string | number, unit: string) {
  return `${Number(quantity).toLocaleString("en-IN", {
    maximumFractionDigits: 3,
  })} ${unit}`;
}
