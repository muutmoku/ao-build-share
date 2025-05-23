import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Container, Grid, Box, useMediaQuery, Button, useTheme, MenuItem, Menu, Typography, IconButton } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import EditIcon from '@mui/icons-material/Edit';
import EditOffIcon from '@mui/icons-material/EditOff';
import TranslateIcon from '@mui/icons-material/Translate';
import BuildEditor, { BuildState } from "./components/BuildEditor";
import BuildPreview from "./components/BuildPreview";

const languages = [
  { code: "EN-US", label: "🇺🇸" },
  { code: "JA-JP", label: "🇯🇵" },
  { code: "DE-DE", label: "🇩🇪" },
  { code: "FR-FR", label: "🇫🇷" },
  { code: "IT-IT", label: "🇮🇹" },
  { code: "RU-RU", label: "🇷🇺" },
  { code: "PL-PL", label: "🇵🇱" },
  { code: "TR-TR", label: "🇹🇷" },
  { code: "ID-ID", label: "🇮🇩" },
  { code: "AR-SA", label: "🇸🇦" },
  { code: "KO-KR", label: "🇰🇷" },
  { code: "PT-BR", label: "🇧🇷" },
  { code: "ZH-TW", label: "🇹🇼" },
  { code: "ZH-CN", label: "🇨🇳" },
  { code: "ES-ES", label: "🇪🇸" },
];

const defaultLang = "EN-US";

function getEditorEnabledFromURL() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get("editor");
  if (value === "false") return false;
  return true;
}

function getLangFromURL() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get("lang");
  return languages.some(l => l.code === value) ? value : defaultLang;
}

export default function App() {
  const theme = useTheme();
  const [lang, setLang] = useState(getLangFromURL());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [buildState, setBuildState] = useState<BuildState | undefined>();
  const [editorEnabled, setEditorEnabled] = useState(getEditorEnabledFromURL());
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleLangChange = (code: string) => {
    setLang(code);
    setAnchorEl(null);
  };
  const current = languages.find(l => l.code === lang) || languages.find(l => l.code === "EN-US");
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("editor", editorEnabled ? "true" : "false");
    params.set("lang", lang || defaultLang);
    const newURL = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newURL);
  }, [editorEnabled, lang]);
  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ position: "relative", minHeight: 64 }}>
          <Button
            color="inherit"
            onClick={handleMenuOpen}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "1.1rem",
              px: 2,
              bgcolor: "transparent",
              minWidth: 56,
              letterSpacing: 1,
            }}
            startIcon={isSmallScreen ? null : <TranslateIcon />}
            endIcon={<ArrowDropDownIcon />}
          >
            {current?.label}
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            {languages.map((l) => (
              <MenuItem
                key={l.code}
                selected={l.code === lang}
                onClick={() => handleLangChange(l.code)}
                sx={{ fontWeight: l.code === lang ? 700 : 400 }}
              >
                {l.label}
              </MenuItem>
            ))}
          </Menu>
          <Typography
            variant="h6"
            component="div"
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
              letterSpacing: "1px"
            }}
          >
            Albion Online Build Share
          </Typography>
          <Box sx={{ ml: "auto" }}>
            <IconButton
              onClick={() => setEditorEnabled(v => !v)}
              color="inherit"
              size="large"
              sx={{ ml: 1 }}
              aria-label={editorEnabled ? "Hide editor" : "Show editor"}
            >
              {editorEnabled ? <EditIcon /> : <EditOffIcon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}
            sx={{ display: editorEnabled ? 'block' : 'none' }}
          >
            <BuildEditor lang={lang || defaultLang} onChange={setBuildState} />
          </Grid>
          <Grid item xs={12} md={editorEnabled ? 6 : 12}>
            <BuildPreview lang={lang || defaultLang} buildState={buildState} />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
