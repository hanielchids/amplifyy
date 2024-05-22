import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/api";
import { list, getUrl } from "aws-amplify/storage";
import { withAuthenticator, Button, Heading } from "@aws-amplify/ui-react";
import { StorageManager } from "@aws-amplify/ui-react-storage";
import "@aws-amplify/ui-react/styles.css";
import {
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableRow,
} from "@aws-amplify/ui-react";

const client = generateClient();

function App({ signOut, user }) {
  const [files, setFiles] = useState([]);
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    async function fetchFiles() {
      try {
        let result;
        if (user?.signInDetails?.loginId === "josephmudzi@gmail.com") {
          result = await list({
            path: "public/",
          });
        } else {
          result = await list({
            path: `public/${user?.signInDetails?.loginId}/`,
          });
        }
        setFiles(result.items);

        // remove console logs later
        console.log("files: ", files)

        for (let i = 0; i < result.items.length; i++) {
          await downloadFileUrl(result.items[i].path);
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchFiles();
  }, [user]);

  const downloadFileUrl = async (filePath) => {
    try {
      const url = await getUrl({ path: filePath });
      setUrls((prevUrls) => [...prevUrls, url]);
    } catch (error) {
      console.error(error);
    }
  };

  const extractFileName = (path) => {
    return path.substring(path.lastIndexOf("/") + 1);
  };

  const extractDirectoryName = (path) => {
    const parts = path.split("/");
    return parts[1];
  };

  return (
    <>
      <div
        className="App"
        style={{
          width: 400,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Heading level={1}>Hello {user?.signInDetails.loginId}</Heading>
        <Button onClick={signOut}>Sign out</Button>

        <h2>
          {user?.signInDetails?.loginId === "josephmudzi@gmail.com"
            ? "Admin Survey Records"
            : "Survey Records"}
        </h2>

        <StorageManager
          acceptedFileTypes={[".zip"]}
          path={`public/${user.signInDetails.loginId}/`}
          maxFileCount={1}
          isResumable
        />
        <h3>Uploaded Files</h3>
        {user?.signInDetails?.loginId === "josephmudzi@gmail.com" ? (
          <Table highlightOnHover={true}>
            <TableHead>
              <TableRow>
                <TableCell as="th">File ID</TableCell>
                <TableCell as="th">File Name</TableCell>
                <TableCell as="th">Uploaded By</TableCell>
                <TableCell as="th">Download</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {files.map((file, index) => {
                const url = urls[index];
                return (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{extractFileName(file.path)}</TableCell>
                    <TableCell>{extractDirectoryName(file.path)}</TableCell>
                    <TableCell>
                      <a href={url.url.href} target="_blank" rel="noreferrer">
                        Download
                      </a>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <Table highlightOnHover={true}>
            <TableHead>
              <TableRow>
                <TableCell as="th">File ID</TableCell>
                <TableCell as="th">File Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {files.map((file, index) => {
                const url = urls[index];
                return (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{extractFileName(file.path)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );
}

export default withAuthenticator(App);
