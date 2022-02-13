import React from "react";
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

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="homePage">
      {!hasLoggedUser && <Navigate to="/login" replace={true} />}
      <FormDialog
        open={open}
        handleClose={handleClose}
        //TODO: change to real submit logic
        handleSubmit={handleClose}
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
