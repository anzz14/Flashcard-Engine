import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6366f1",
    },
  },
  typography: {
    fontFamily: "Poppins, sans-serif",
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#151515",
          color: "#ffffff",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: "#ffffff",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: "#ffffff",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: "#151515",
          color: "#ffffff",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
        },
        list: {
          paddingTop: 4,
          paddingBottom: 4,
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundColor: "#151515",
          color: "#ffffff",
          border: "1px solid rgba(255,255,255,0.10)",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.06)",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "rgba(255,255,255,0.70)",
          "&.Mui-focused": {
            color: "#ff6a3d",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          color: "#ffffff",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ffffff",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ffffff",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ff6a3d",
          },
        },
        input: {
          color: "#ffffff",
          "&::placeholder": {
            color: "rgba(255,255,255,0.10)",
            opacity: 1,
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#ff6a3d",
          color: "#000000",
          border: "1px solid rgba(0,0,0,0.12)",
        },
        arrow: {
          color: "#ff6a3d",
        },
      },
    },
  },
});
