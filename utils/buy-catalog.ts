export type BuyCatalogItem = Record<string, unknown>;

export type BuyCatalogGroup = {
  id: string | number;
  name: string;
  icon: string;
  items: BuyCatalogItem[];
};

const isRecord = (value: unknown): value is BuyCatalogItem =>
  typeof value === "object" && value !== null;

const toCatalogItems = (value: unknown) =>
  Array.isArray(value) ? value.filter(isRecord) : [];

export const parseBuyCatalogGroupName = (raw: unknown) => {
  if (typeof raw !== "string" || !raw.trim()) {
    return { displayName: "", icon: "" };
  }

  const parts = raw.split(",").map((item) => item.trim());
  let icon = "";
  let displayName = "";

  const isStylingMetadata = (value: string) =>
    value.includes("synull-") ||
    /\b(?:m[trblxy]?-\d+|p[trblxy]?-\d+|rounded-[a-z-]+)\b/i.test(value);

  for (const part of parts) {
    if (!part) {
      continue;
    }

    const normalized = part.replace("/", ":");

    if (/^[a-z0-9-]+:[a-z0-9-]+/i.test(normalized)) {
      icon = normalized;
      continue;
    }

    if (/^\d+$/.test(part)) {
      continue;
    }

    if (isStylingMetadata(part)) {
      continue;
    }

    if (!displayName) {
      displayName = part;
    }
  }

  return {
    displayName,
    icon,
  };
};

export const normalizeBuyCatalogGroups = (data: unknown): BuyCatalogGroup[] => {
  if (Array.isArray(data)) {
    const items = toCatalogItems(data);
    return items.length ? [{ id: 0, name: "", icon: "", items }] : [];
  }

  if (!isRecord(data)) {
    return [];
  }

  if (Array.isArray(data.products)) {
    return data.products
      .filter(isRecord)
      .map((group, index) => {
        const rawName = typeof group.name === "string" ? group.name : "";
        const parsed = parseBuyCatalogGroupName(rawName);
        const groupId = group.id;

        return {
          id:
            typeof groupId === "number" || typeof groupId === "string"
              ? groupId
              : index,
          name: parsed.displayName,
          icon: parsed.icon,
          items: toCatalogItems(group.products),
        };
      })
      .filter((group) => group.items.length > 0);
  }

  if (isRecord(data.products)) {
    const groups: BuyCatalogGroup[] = [];

    for (const [groupName, items] of Object.entries(data.products)) {
      const groupItems = toCatalogItems(items);

      if (!groupItems.length) {
        continue;
      }

      const parsed = parseBuyCatalogGroupName(groupName);
      groups.push({
        id: groupName,
        name: parsed.displayName,
        icon: parsed.icon,
        items: groupItems,
      });
    }

    return groups;
  }

  const items = Object.values(data).filter(
    (value): value is BuyCatalogItem =>
      isRecord(value) && value.id !== undefined && value.id !== null
  );

  return items.length ? [{ id: 0, name: "", icon: "", items }] : [];
};
