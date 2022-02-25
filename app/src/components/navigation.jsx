import React from "react";
import axios from "axios";

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
import { Divider } from "@mui/material";

const drawerWidth = 240;

export default function Navigation(props) {
  const openFile = async (e, file) => {
    const config = {
      headers: {
        Accept: "*/*",
        authorization: localStorage.getItem("authToken"),
      },
      params: { path: localStorage.getItem("path") + "/" + file },
    };

    axios.get("http://127.0.0.1:8090/open", config).then((res) => {
      if (res.status === 200) {
        console.log(res);
        if (res.headers["content-type"] === "image/png; charset=utf-8")
          props.handleImage(res.data);
        document.getElementById("file-content").textContent = "";
        if (res.headers["content-type"] === "text/plain; charset=utf-8") {
          document.getElementById("file-content").textContent = res.data;
          props.handleImage("");
        }
      }
    });
  };

  const changeLocation = (path) => {
    let newPath = path;
    if (
      path !== "/" &&
      path !== localStorage.getItem("path") &&
      localStorage.getItem("path") !== "/"
    )
      newPath = localStorage.getItem("path") + "/" + path;

    if (localStorage.getItem("path") === "/")
      newPath = localStorage.getItem("path") + path;

    localStorage.setItem("path", newPath);
    window.location.reload();
  };

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
            <ListItem button key={"root"} onClick={(e) => changeLocation("/")}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary={"Home"} />
            </ListItem>
            <Divider />
            {props.dirs.map((dir) => (
              <ListItem
                button={true}
                key={dir.name}
                onClick={(e) => {
                  if (!dir.type) openFile(e, dir.name);
                  else changeLocation(dir.name);
                }}
              >
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
