import React, { useState } from "react";
import { Container, Grid, Box, FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import BuildEditor, { BuildState } from "./components/BuildEditor";
import BuildPreview from "./components/BuildPreview";

const languages = [
  { code: "EN-US", label: "English" },
  { code: "JA-JP", label: "日本語" },
  { code: "DE-DE", label: "Deutsch" },
  { code: "FR-FR", label: "Français" },
  { code: "IT-IT", label: "Italiano" },
  { code: "RU-RU", label: "Русский" },
  { code: "PL-PL", label: "Polski" },
  { code: "TR-TR", label: "Türkçe" },
  { code: "ID-ID", label: "Bahasa Indonesia" },
  { code: "AR-SA", label: "العربية" },
  { code: "KO-KR", label: "한국어" },
  { code: "PT-BR", label: "Português (Brasil)" },
  { code: "ZH-TW", label: "繁體中文" },
  { code: "ZH-CN", label: "简体中文" },
  { code: "ES-ES", label: "Español" },
];

const defaultLang = "EN-US";

export default function App() {
  const [lang, setLang] = useState(defaultLang);
  const [buildState, setBuildState] = useState<BuildState | undefined>();

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Box mb={4} display="flex" alignItems="center" justifyContent="center" gap={2}>
        <FormControl>
          <InputLabel id="lang-select-label">Language</InputLabel>
          <Select
            labelId="lang-select-label"
            value={lang}
            label="Language"
            onChange={(e) => setLang(e.target.value)}
          >
            {languages.map((l) => (
              <MenuItem key={l.code} value={l.code}>{l.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="h5" fontWeight="bold">Albion Online Build Editor</Typography>
      </Box>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <BuildEditor lang={lang} onChange={setBuildState} />
        </Grid>
        <Grid item xs={12} md={6}>
          <BuildPreview lang={lang} buildState={buildState} />
        </Grid>
      </Grid>
    </Container>
  );
}
