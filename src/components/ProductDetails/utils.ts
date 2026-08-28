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
