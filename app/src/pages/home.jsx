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
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PublishIcon from "@mui/icons-material/Publish";
import CancelIcon from "@mui/icons-material/Cancel";

import BreadcrumbsNav from "../components/breadcrumbs";
import FormDialog from "../components/popup";

export default function HomePage() {
  const hasLoggedUser = localStorage.getItem("authToken");

  const [folderName, setFolderName] = useState("");
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFolderName("");
  };

  const handleUploadFile = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      //TODO: error handling
      console.log("NO SELECTED FILE!!");
      return;
    }

    let result = await fetch("http://127.0.0.1:8080/upload-files", {
      method: "post",
      body: JSON.stringify({ file: files[0] }),
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        authorization: localStorage.getItem("authToken"),
      },
    });

    result = await result.json();
    if (result.data) {
      console.log("UPLOADED FILE");
      // TODO: show added file
      setOpen(false);
    }
    if (result.error !== null && result.error.length > 0) {
      //TODO: error handling
      console.log("ERROR!");
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();

    if (folderName === "") {
      //TODO: error handling
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
      // TODO: fetch back new directory or only show it
      setOpen(false);
    }
    if (result.error !== null && result.error.length > 0) {
      //TODO: error handling
      console.log("ERROR!");
    }
  };

  return (
    <div className="homePage">
      {!hasLoggedUser && <Navigate to="/login" replace={true} />}
      <FormDialog
        open={open}
        name={folderName}
        handleNameChange={(e) => setFolderName(e.target.value)}
        handleClose={handleClose}
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
              // TODO: search logic
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
          alignItems: "center",
        }}
      >
        <BreadcrumbsNav />
        <div>
          <Tooltip title="Create new Folder">
            <Button omponent="label" onClick={handleClickOpen}>
              <CreateNewFolderIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Upload file">
            <Button component="label">
              <UploadFileIcon />
              <input
                type="file"
                hidden
                onChange={(e) => {
                  console.log(e.target.files);
                  setFiles(e.target.files ? e.target.files : []);
                }}
              />
            </Button>
          </Tooltip>
        </div>
        {files.length > 0 && (
          <div
            style={{
              backgroundColor: "white",
              padding: "5px 10px",
              borderRadius: "15px",
            }}
          >
            {files[0].name}{" "}
            <Button onClick={handleUploadFile}>
              <PublishIcon />
            </Button>{" "}
            <Button onClick={() => setFiles([])}>
              <CancelIcon />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
