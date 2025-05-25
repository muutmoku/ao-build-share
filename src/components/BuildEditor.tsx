import React, { useEffect, useState } from "react";
import { TextField, Grid, MenuItem } from "@mui/material";
import ItemAutocomplete from "./ItemAutocomplete";

export type SlotKey =
  | "head"
  | "armor"
  | "shoes"
  | "mainhand"
  | "offhand"
  | "cape"
  | "potion"
  | "food"
  | "mount"
  | "bag";

export type BuildSlots = {
  [key in SlotKey]: string;
} & {
  [key in `${SlotKey}Enchant`]: string;
};

export type BuildState = {
  title: string;
  desc: string;
  slots: BuildSlots;
};

type EnchantMap = Record<SlotKey, Record<string, string[]>>;

const slots: SlotKey[] = [
  "head",
  "armor",
  "shoes",
  "mainhand",
  "offhand",
  "cape",
  "potion",
  "food",
  "mount",
  "bag",
];

const defaultBuildSlots: BuildSlots = {
  head: "",
  headEnchant: "",
  armor: "",
  armorEnchant: "",
  shoes: "",
  shoesEnchant: "",
  mainhand: "",
  mainhandEnchant: "",
  offhand: "",
  offhandEnchant: "",
  cape: "",
  capeEnchant: "",
  potion: "",
  potionEnchant: "",
  food: "",
  foodEnchant: "",
  mount: "",
  mountEnchant: "",
  bag: "",
  bagEnchant: "",
};

function encodeBuildToQuery(state: BuildState): string {
  const params = new URLSearchParams();
  params.set("title", state.title);
  params.set("desc", state.desc);
  Object.entries(state.slots).forEach(([k, v]) => params.set(k, v));
  return params.toString();
}

function decodeQueryToBuildState(query: string): BuildState {
  const params = new URLSearchParams(query);
  const title = params.get("title") || "";
  const desc = params.get("desc") || "";
  const slots: BuildSlots = { ...defaultBuildSlots };
  Object.keys(defaultBuildSlots).forEach((key) => {
    const v = params.get(key);
    if (v !== null) (slots as any)[key] = v;
  });
  return { title, desc, slots };
}

type Props = {
  lang: string;
  onChange?: (state: BuildState) => void;
};

const BuildEditor: React.FC<Props> = ({ lang, onChange }) => {
  const initialState = decodeQueryToBuildState(window.location.search.slice(1));
  const [title, setTitle] = useState(initialState.title);
  const [desc, setDesc] = useState(initialState.desc);
  const [slotsState, setSlotsState] = useState<BuildSlots>(initialState.slots);

  const [enchantMap, setEnchantMap] = useState<EnchantMap>({
    head: {},
    armor: {},
    shoes: {},
    mainhand: {},
    offhand: {},
    potion: {},
    cape: {},
    food: {},
    mount: {},
    bag: {},
  });

  useEffect(() => {
    const fetchAllEnchants = async () => {
      const result: EnchantMap = {
        head: {},
        armor: {},
        shoes: {},
        mainhand: {},
        offhand: {},
        cape: {},
        potion: {},
        food: {},
        mount: {},
        bag: {},
      };

      await Promise.all(
        slots.map(async (slot) => {
          const res = await fetch(
            `https://muutmoku.github.io/ao-item-snapshot/data/latest/${slot}.json`
          );
          const data: any[] = await res.json();

          const map: Record<string, string[]> = {};

          for (const item of data) {
            const match = item.uniqueName.match(/^T\d+_(.+?)(?:@(\d))?$/);
            if (!match) continue;
            const base = match[1];

            let enchantSet = new Set<string>();
            if (item.enchantmentLevel !== undefined) {
              enchantSet.add(String(item.enchantmentLevel));
            } else {
              enchantSet.add(match[2] ?? "0");
            }
            if (
              item.enchantments &&
              Array.isArray(item.enchantments.enchantments)
            ) {
              for (const ench of item.enchantments.enchantments) {
                if (ench.enchantmentLevel !== undefined) {
                  enchantSet.add(String(ench.enchantmentLevel));
                }
              }
            }
            if (!map[base]) map[base] = [];
            for (const ench of Array.from(enchantSet)) {
              if (!map[base].includes(ench)) map[base].push(ench);
            }
          }
          Object.keys(map).forEach((base) =>
            map[base].sort((a, b) => Number(a) - Number(b))
          );
          result[slot] = map;
        })
      );

      setEnchantMap(result);
    };

    fetchAllEnchants();
  }, []);

  useEffect(() => {
    const newState: BuildState = { title, desc, slots: slotsState };
    if (onChange) onChange(newState);

    const query = encodeBuildToQuery(newState);
    const url = `${window.location.pathname}?${query}`;
    window.history.replaceState(null, "", url);
    // eslint-disable-next-line
  }, [slotsState, title, desc]);

  const handleSlotChange = (key: keyof BuildSlots, value: string) => {
    setSlotsState((prev) => ({ ...prev, [key]: value }));
  };

  const renderSlot = (slot: SlotKey, label: string) => {
    const uniqueName = slotsState[slot];
    const baseId = uniqueName ? uniqueName.split("@")[0].replace(/^T\d+_/, "") : "";
    const availableOptions = baseId ? enchantMap[slot][baseId] || [] : [];
    const selectedEnchant = slotsState[`${slot}Enchant`] || "";

    function handleItemChange(v: string) {
      const newBaseId = v ? v.split("@")[0].replace(/^T\d+_/, "") : "";
      const newOptions = newBaseId ? enchantMap[slot][newBaseId] || [] : [];
      handleSlotChange(slot, v);
      handleSlotChange(
        `${slot}Enchant` as keyof BuildSlots,
        newOptions.length === 1 ? newOptions[0] : (newOptions[0] || "")
      );
    }

    return (
      <React.Fragment key={slot}>
        <Grid item xs={6}>
          <ItemAutocomplete
            slot={slot}
            label={label}
            value={uniqueName}
            onChange={handleItemChange}
            lang={lang}
          />
        </Grid>
        <Grid item xs={6}>
          {availableOptions.length === 0 ? (
            <TextField
              fullWidth
              label={`${label} Enchant`}
              value=""
              disabled
              placeholder="Not available"
            />
          ) : availableOptions.length === 1 ? (
            <TextField
              fullWidth
              label={`${label} Enchant`}
              value={availableOptions[0]}
              InputProps={{ readOnly: true }}
            />
          ) : (
            <TextField
              fullWidth
              select
              label={`${label} Enchant`}
              value={selectedEnchant}
              onChange={(e) =>
                handleSlotChange(
                  `${slot}Enchant` as keyof BuildSlots,
                  e.target.value
                )
              }
            >
              {availableOptions.map((e) => (
                <MenuItem key={e} value={e}>{`.${e}`}</MenuItem>
              ))}
            </TextField>
          )}
        </Grid>
      </React.Fragment>
    );
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </Grid>
      {slots.map((slot) =>
        renderSlot(slot, slot.charAt(0).toUpperCase() + slot.slice(1))
      )}
    </Grid>
  );
};

export default BuildEditor;
