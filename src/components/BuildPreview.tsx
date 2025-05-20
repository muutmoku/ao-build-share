import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid } from "@mui/material";
import { BuildState, SlotKey } from "./BuildEditor";

type ItemInfo = {
  uniqueName: string;
  localizedNames: { [lang: string]: string };
};

type Props = {
  lang: string;
  buildState?: BuildState;
};

const slots: SlotKey[] = ["head", "armor", "shoes", "mainhand", "offhand", "potion", "food", "mount", "bag"];

const slotLabels: Record<SlotKey, string> = {
  head: "Head", armor: "Armor", shoes: "Shoes",
  mainhand: "Main Hand", offhand: "Off Hand",
  potion: "Potion", food: "Food", mount: "Mount", bag: "Bag"
};

const BuildPreview: React.FC<Props> = ({ lang, buildState }) => {
  const [itemData, setItemData] = useState<Record<SlotKey, ItemInfo | null>>({
    head: null, armor: null, shoes: null,
    mainhand: null, offhand: null,
    potion: null, food: null, mount: null, bag: null,
  });

  useEffect(() => {
    if (!buildState) return;
    slots.forEach((slot) => {
      const uniqueName = buildState.slots[slot];
      if (!uniqueName) {
        setItemData((prev) => ({ ...prev, [slot]: null }));
        return;
      }
      fetch(`https://muutmoku.github.io/ao-item-snapshot/data/latest/${slot}.json`)
        .then((res) => res.json())
        .then((items: ItemInfo[]) => {
          const item = items.find(i => i.uniqueName === uniqueName);
          setItemData((prev) => ({ ...prev, [slot]: item || null }));
        });
    });
    // eslint-disable-next-line
  }, [buildState]);

  if (!buildState) return <Typography color="text.secondary">No build selected.</Typography>;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{buildState.title || "No Title"}</Typography>
        <Typography variant="body2" gutterBottom color="text.secondary">{buildState.desc}</Typography>
        <Grid container spacing={2}>
          {slots.map((slot) => {
            const item = itemData[slot];
            const enchant = buildState.slots[`${slot}Enchant`];
            if (!item) return null;
            // 画像URL
            const itemIdWithEnchant = enchant && enchant !== "0" ? `${item.uniqueName}@${enchant}` : item.uniqueName;
            const imgUrl = `https://render.albiononline.com/v1/item/${itemIdWithEnchant}.png`;
            const localized = item.localizedNames?.[lang] || item.localizedNames?.["EN-US"] || item.uniqueName;
            return (
              <Grid item xs={6} sm={4} md={3} key={slot}>
                <Card variant="outlined">
                  <CardContent>
                    <img src={imgUrl} alt={localized} width={64} height={64} style={{ display: "block", margin: "0 auto" }} />
                    <Typography align="center" variant="subtitle2" sx={{ mt: 1 }}>{slotLabels[slot]}</Typography>
                    <Typography align="center" variant="body2">{localized}</Typography>
                    {enchant && <Typography align="center" color="text.secondary" variant="caption">{enchant !== "0" ? `+${enchant}` : ""}</Typography>}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default BuildPreview;
