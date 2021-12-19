import React from "react";
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

export default function HomePage() {
  return (
    <div className="homePage">
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
