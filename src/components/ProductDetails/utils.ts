export interface VariantRow {
  variantUuid: string;
  variantName: string;
  attributeGroup: string;
  attribute: string;
  mrpUnitSale: number;
  retailUnitSale: number;
  thumbnailUrl: string;
  isActive: boolean;
  isTba: boolean;
}

export interface VariantApiResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  data: VariantRow[];
}

export interface ConsolidatedVariant {
  id: string;
  variantUuid: string;
  name: string;
  mrp: number;
  price: number;
  thumbnailUrl: string;
  attributes: Record<string, string>;
}

export function consolidateVariants(rows: VariantRow[]): {
  groups: string[];
  variants: ConsolidatedVariant[];
} {
  if (!rows || rows.length === 0) return { groups: [], variants: [] };

  const normalizeGroup = (raw: string): string => {
    const lower = raw.trim().toLowerCase();
    if (lower === "color") return "Color";
    if (lower === "storage") return "Storage";
    if (
      lower === "ram & storage" ||
      lower === "ram&storage" ||
      lower === "ram and storage"
    )
      return "RAM & Storage";
    if (lower.startsWith("region")) return "Region/Variant";
    return raw.trim().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const normalizeAttr = (group: string, value: string): string => {
    const v = value.trim();
    if (group === "Storage") {
      if (/^\d+$/.test(v)) return v + "GB";
      return v.toUpperCase().replace(/\s+/g, "");
    }
    return v;
  };

  const activeRows = rows
    .filter(
      (row) =>
        row.isActive &&
        !row.isTba &&
        row.attributeGroup?.trim() &&
        row.attribute?.trim(),
    )
    .map((row) => ({
      ...row,
      _normGroup: normalizeGroup(row.attributeGroup),
      _normAttr: normalizeAttr(
        normalizeGroup(row.attributeGroup),
        row.attribute,
      ),
    }));

  const groupOrder = ["Color", "Storage", "RAM & Storage", "Region/Variant"];
  const foundGroups = new Set(activeRows.map((r) => r._normGroup));
  const groups = groupOrder.filter((g) => foundGroups.has(g));
  activeRows.forEach((r) => {
    if (!groups.includes(r._normGroup)) groups.push(r._normGroup);
  });
  const variantMap = new Map<string, ConsolidatedVariant>();

  activeRows.forEach((row) => {
    const uuid = row.variantUuid;
    if (!variantMap.has(uuid)) {
      variantMap.set(uuid, {
        id: uuid,
        variantUuid: uuid,
        name: row.variantName ?? "",
        mrp: 0,
        price: 0,
        thumbnailUrl: "",
        attributes: {},
      });
    }

    const existing = variantMap.get(uuid)!;
    if (!existing.attributes[row._normGroup]) {
      existing.attributes[row._normGroup] = row._normAttr;
    }

    if (row.retailUnitSale > 0 && existing.price === 0) {
      existing.price = row.retailUnitSale;
      existing.mrp = row.mrpUnitSale;
    }

    if (row.thumbnailUrl?.trim() && !existing.thumbnailUrl) {
      existing.thumbnailUrl = row.thumbnailUrl.trim();
    }
    if (row.variantName?.trim() && !existing.name) {
      existing.name = row.variantName.trim();
    }
  });

  const completeVariants = [...variantMap.values()].filter((v) =>
    groups.every((g) => v.attributes[g]?.trim()),
  );
  const nonStorageGroups = groups.filter(
    (g) => g !== "Storage" && g !== "RAM & Storage",
  );

  completeVariants.forEach((v) => {
    if (v.price > 0) return;
    const donor = completeVariants.find(
      (other) =>
        other.id !== v.id &&
        other.price > 0 &&
        nonStorageGroups.every((g) => other.attributes[g] === v.attributes[g]),
    );
    if (donor) {
      v.price = donor.price;
      v.mrp = donor.mrp;
    }
  });

  const finalVariants = completeVariants;
  finalVariants.forEach((v) => {
    if (!v.name) {
      v.name = groups
        .map((g) => v.attributes[g])
        .filter(Boolean)
        .join(" ");
    }
  });

  return { groups, variants: finalVariants };
}
