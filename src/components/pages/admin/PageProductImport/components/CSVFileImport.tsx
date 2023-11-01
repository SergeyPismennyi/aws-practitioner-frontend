import React from "react";
import axios, { AxiosError } from "axios";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

type CSVFileImportProps = {
  url: string;
  title: string;
  isPrivate?: boolean;
};

export default function CSVFileImport({
  url,
  title,
  isPrivate,
}: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();
  const [requestError, setRequestError] = React.useState<string | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const uploadFile = async () => {
    console.log("uploadFile to", url);
    const fileName = file?.name || "";

    // Get the presigned URL
    try {
      const response = await axios({
        method: "GET",
        url,
        headers: {
          ...(isPrivate
            ? {
                Authorization:
                  localStorage.getItem("authorization_token") || "",
              }
            : {}),
        },
        params: {
          name: encodeURIComponent(fileName),
        },
      });
      setRequestError(null);

      console.log("File to upload: ", fileName);
      console.log("Uploading to: ", response.data);

      const result = await fetch(response.data, {
        method: "PUT",
        body: file,
      });

      console.log("Result: ", result);
      setFile(undefined);
    } catch (error) {
      const {
        request: { status },
        message,
      } = error as AxiosError;

      setRequestError(
        `Request failed: status code - ${status}; message - ${message}`
      );
    }
  };
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {isPrivate && (
        <Typography fontSize={14} paragraph>
          Add your token to local storage
          (localStorage.setItem(&quot;authorization_token&quot;, &quot;Basic
          [your token]&quot;)
        </Typography>
      )}
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
      {requestError && (
        <Typography color="red" paragraph>
          {requestError}
        </Typography>
      )}
    </Box>
  );
}
