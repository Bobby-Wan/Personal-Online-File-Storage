import React from "react";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import AttachmentIcon from "@mui/icons-material/Attachment";
import FolderIcon from "@mui/icons-material/Folder";
import { Toolbar } from "@mui/material";

const drawerWidth = 240;

export default function Navigation(props: any) {
  return (
    <Box className="navigation" sx={{ display: "flex" }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Box sx={{ overflow: "auto" }}>
          <List>
            <Toolbar></Toolbar>
            <ListItem button key={"root"}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary={"Home"} />
            </ListItem>
            {props.dirs.map((dir: any) => (
              <ListItem button key={dir.name}>
                <ListItemIcon>
                  {dir.type === 0 ? <AttachmentIcon /> : <FolderIcon />}
                </ListItemIcon>
                <ListItemText primary={dir.name} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}
