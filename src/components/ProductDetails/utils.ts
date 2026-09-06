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

  // ── Normalize group name ───────────────────────────────────────────────────
  const normalizeGroup = (raw: string): string => {
    const lower = raw.trim().toLowerCase();
    if (lower === "color") return "Color";
    // "Storage" and "RAM & Storage" are treated as the same display group.
    // Many products have rows labelled "storage" (plain, no RAM) while others
    // use "ram & storage". Merging them avoids the situation where a variant
    // map entry has BOTH "Storage" and "RAM & Storage" slots missing because
    // its rows only ever used one of the two labels.
    if (
      lower === "storage" ||
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
    if (group === "RAM & Storage" || group === "Storage") {
      // bare number → append GB (e.g. "256" → "256GB")
      if (/^\d+$/.test(v)) return v + "GB";
      return v;
    }
    return v;
  };

  // ── Build active rows ───────────────────────────────────────────────────────
  const activeRows = rows
    .filter(
      (row) =>
        row.isActive &&
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

  // ── Determine which groups exist across ALL rows ───────────────────────────
  const groupOrder = ["Color", "RAM & Storage", "Region/Variant"];
  const foundGroups = new Set(activeRows.map((r) => r._normGroup));
  const groups = groupOrder.filter((g) => foundGroups.has(g));
  // Append any extra groups not in the standard order
  activeRows.forEach((r) => {
    if (!groups.includes(r._normGroup)) groups.push(r._normGroup);
  });

  // ── Build variant map: uuid → ConsolidatedVariant ─────────────────────────
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

    // Only set the first value for each group
    if (!existing.attributes[row._normGroup]) {
      existing.attributes[row._normGroup] = row._normAttr;
    }

    if (row.retailUnitSale > 0 && existing.price === 0) {
      existing.price = row.retailUnitSale;
      existing.mrp = row.mrpUnitSale;
    }

    // Track isTba per variant
    if (row.isTba && !existing.attributes["_isTba"]) {
      existing.attributes["_isTba"] = "true";
    }

    if (row.thumbnailUrl?.trim() && !existing.thumbnailUrl) {
      existing.thumbnailUrl = row.thumbnailUrl.trim();
    }
    if (row.variantName?.trim() && !existing.name) {
      existing.name = row.variantName.trim();
    }
  });

  // ── Filter: keep variants that have AT LEAST ONE group attribute ───────────
  // "complete" = has all groups; "partial" = has at least one group.
  // We prefer complete variants first. If none are complete (which happens
  // when the backend uses inconsistent group sets across rows), we fall back
  // to partial variants so the UI never shows empty option chips.
  const allVariants = [...variantMap.values()];

  const completeVariants = allVariants.filter((v) =>
    groups.every((g) => v.attributes[g]?.trim()),
  );

  const partialVariants = allVariants.filter((v) =>
    groups.some((g) => v.attributes[g]?.trim()),
  );

  const finalVariants = completeVariants.length > 0
    ? completeVariants
    : partialVariants;

  // ── Price fallback: copy price from sibling with same non-storage attrs ────
  const nonStorageGroups = groups.filter((g) => g !== "RAM & Storage");
  finalVariants.forEach((v) => {
    if (v.price > 0) return;
    const donor = finalVariants.find(
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

  // ── Build display name for variants missing one ───────────────────────────
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

/**
 * One entry in the product image gallery.
 *
 * The gallery and the colour swatches are two views of the same list, so an
 * image carries the colour it belongs to. That lets the two stay in sync:
 * picking a thumbnail selects its colour, and picking a colour jumps the
 * gallery to its image. `disabled` mirrors the swatch's own disabled state so
 * an unavailable colour looks — and behaves — the same in both places.
 *
 * `color` is undefined for images that aren't tied to any single colour
 * (extra product shots); those are always selectable.
 */
export interface GalleryImage {
  url: string;
  color?: string;
  disabled?: boolean;
}

/** Accept a plain URL list or a GalleryImage list and normalise to the latter. */
export function toGalleryImages(
  images: (string | GalleryImage)[],
): GalleryImage[] {
  return images
    .map((img) => (typeof img === "string" ? { url: img } : img))
    .filter((img) => !!img.url);
}
