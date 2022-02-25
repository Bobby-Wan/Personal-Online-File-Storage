import React, { useState } from "react";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

import { Button, Tooltip } from "@mui/material";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PublishIcon from "@mui/icons-material/Publish";
import CancelIcon from "@mui/icons-material/Cancel";

import BreadcrumbsNav from "../components/breadcrumbs";
import FormDialog from "../components/popup";
import Navigation from "../components/navigation";

export default function HomePage() {
  const hasLoggedUser = localStorage.getItem("authToken");

  const [folderName, setFolderName] = useState("");
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [allDirs, setAllDirs] = useState([]);
  const [image, setImage] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFolderName("");
  };

  const handleUploadFile = async (e) => {
    e.preventDefault();

    if (!files.length) {
      console.log("NO SELECTED FILE!!");
      return;
    }

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "*/*",
        authorization: hasLoggedUser,
      },
      params: { filepath: localStorage.getItem("path") },
    };

    const data = new FormData();
    for (var x = 0; x < files.length; x++) {
      data.append("file", files[x]);
    }

    axios
      .post("http://127.0.0.1:8090/upload-file", data, config)
      .then((res) => {
        setFiles([]);
        getContent();
      });
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();

    if (folderName === "") {
      console.log("NO NAME!!");
      return;
    }

    const config = {
      headers: {
        Accept: "*/*",
        authorization: hasLoggedUser,
      },
      params: { path: folderName },
    };

    axios
      .post("http://127.0.0.1:8090/upload-folder", null, config)
      .then((res) => {
        if (res.status === 200) {
          handleClose();
          getContent();
          return;
        }
      });
  };

  const getContent = async () => {
    const config = {
      headers: {
        Accept: "*/*",
        authorization: localStorage.getItem("authToken"),
      },
      params: { path: localStorage.getItem("path") },
    };

    axios.get("http://127.0.0.1:8090/content", config).then((res) => {
      setAllDirs(res.data.data);
    });
  };

  const handleClick = (location) => {
    switch (location) {
      case "Home": {
        if (localStorage.getItem("path") !== "/") {
          localStorage.setItem("path", "/");
          window.location.reload();
        }
        break;
      }
      default: {
        const path = localStorage
          .getItem("path")
          .split(location)[0]
          .concat(location);
        localStorage.setItem("path", path);
        window.location.reload();
        break;
      }
    }
  };

  useEffect(() => {
    if (localStorage.getItem("authToken")) getContent();
  }, [hasLoggedUser]);

  return (
    <div className="homePage">
      <div>
        <Navigation dirs={allDirs} handleImage={(image) => setImage(image)} />
        {!hasLoggedUser && <Navigate to="/login" replace={true} />}
        <FormDialog
          open={open}
          name={folderName}
          handleNameChange={(e) => setFolderName(e.target.value)}
          handleClose={handleClose}
          handleSubmit={handleCreateFolder}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <BreadcrumbsNav handleClick={(location) => handleClick(location)} />
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
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                />
              </Button>
            </Tooltip>
          </div>
          {files.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {Object.values(files).map((file, index) => {
                return (
                  <div
                    style={{
                      backgroundColor: "white",
                      padding: "5px 10px",
                      margin: "5px 0",
                      borderRadius: "15px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    {file.name}
                    <Button
                      onClick={() =>
                        setFiles(removeFileFromSelectedFiles(file.name, files))
                      }
                    >
                      <CancelIcon />
                    </Button>
                  </div>
                );
              })}
              <div>
                <Button
                  onClick={handleUploadFile}
                  variant="contained"
                  size="small"
                  style={{ width: "50%", alignSelf: "center" }}
                >
                  Upload <PublishIcon />
                </Button>
                <Button onClick={() => setFiles([])}>
                  <CancelIcon />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <img src={"data:image/png;base64, " + image} alt="" width={"500px"} />
    </div>
  );
}

const removeFileFromSelectedFiles = (fileName, files) => {
  const filteredFiles = (files = [...files].filter((s) => s.name !== fileName));
  return filteredFiles;
};
