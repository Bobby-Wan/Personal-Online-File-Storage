import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import {
  IconButton,
  Input,
  InputLabel,
  InputAdornment,
  FormControl,
  Button,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import BreadcrumbsNav from "../components/breadcrumbs";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import FormDialog from "../components/popup";

export default function HomePage() {
  const hasLoggedUser = localStorage.getItem("authToken");

  const [folderName, setFolderName] = useState("");
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();

    if (folderName === "") {
      // setError("Fields are required");
      console.log("NO NAME!!");
      return;
    }

    let result = await fetch("http://127.0.0.1:8080/create", {
      method: "post",
      body: JSON.stringify({ path: folderName }),
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        authorization: localStorage.getItem("authToken"),
      },
    });

    result = await result.json();
    if (result.data) {
      console.log("CREATED FOLDER");
      // fetch back new directory or only show it
      setOpen(false);
    }
    if (result.error !== null && result.error.length > 0) console.log("ERROR!");
  };

  return (
    <div className="homePage">
      {!hasLoggedUser && <Navigate to="/login" replace={true} />}
      <FormDialog
        open={open}
        name={folderName}
        handleNameChange={(e) => setFolderName(e.target.value)}
        handleClose={handleClose}
        //TODO: change to real submit logic
        handleSubmit={handleCreateFolder}
      />
      <FormControl sx={{ m: 1, width: "50ch" }}>
        <InputLabel htmlFor="standard-adornment-text" variant="standard">
          Search
        </InputLabel>
        <Input
          endAdornment={
            <InputAdornment position="end">
              <IconButton
              // onClick={handleClickSearch}
              >
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>
      <div
        style={{
          display: "flex",
          // justifyContent: "space-evenly",
          alignItems: "center",
        }}
      >
        <BreadcrumbsNav />
        <div>
          <Tooltip title="Create new Folder">
            <Button
              omponent="label"
              // onClick={handleClickCreateFolder}
              onClick={handleClickOpen}
            >
              <CreateNewFolderIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Upload file">
            <Button
              component="label"
              // onClick={handleClickUploadFile}
            >
              <UploadFileIcon />
              <input type="file" hidden />
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
