import express from "express";
import getFolderStructure from "./utils/getFolderStructure.js";
import formidable from "formidable";
import fsExtra from "fs-extra";
import dotenv from "dotenv";
import archiver from "archiver";
dotenv.config();
const app = express();
const PORT = 8000;

function getName(oldName, directory) {
  console.log("Oldname: " + oldName);
  const allFiles = fsExtra
    .readdirSync(
      `C:\\Users\\DELL\\Desktop\\My-space\\VScode-programs\\The-web\\websites\\Node-File-Manipulation\\uploads\\${directory}`,
      { withFileTypes: true, recursive: true }
    )
    .filter((item) => !item.isDirectory())
    .map((item) => item.name);

  console.log("All files = " + allFiles);
  //TODO: Add Support for file names which contain two extensions such as Karan.docx.pdf
  if (allFiles.includes(oldName)) {
    const name = oldName.split(".");
    oldName = name[0] + "$." + name[name.length - 1];
    console.log("Name Already Exists\nChecking for newname " + oldName + "\n");
    return getName(oldName, directory);
  }
  return oldName;
}

//All Post requests
//Upload a file to specific folder
/** Give the path to that specific directory in query such as
 * haila\\folder1
 * haila\\ESE sem 1
 */
app.post("/upload", (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    const directoryPath = `${fields.path}`;
    const oldpath = files.fileupload.filepath;
    const newpath = `C:\\Users\\DELL\\Desktop\\My-space\\VScode-programs\\The-web\\websites\\Node-File-Manipulation\\uploads\\${getName(
      files.fileupload.originalFilename,
      directoryPath
    )}`;
    fsExtra.moveSync(oldpath, newpath, (err) => {
      if (err) {
        console.error(err);
        res.json({
          message: "Error Occured",
          error: err,
        });
      }
    });
    console.log(
      `ADDED FILE '${
        files.fileupload.originalFilename
      }' TO ${newpath} on ${new Date()}`
    );
    res.json({
      message: "File Uploaded Successfully",
    });
  });
});

app.post("/createDirectory", (req, res) => {
  const name = req.query.name;
  const path = `C:\\Users\\DELL\\Desktop\\My-space\\VScode-programs\\The-web\\websites\\Node-File-Manipulation\\uploads\\${name}`;
  fsExtra.mkdirSync(path, { recursive: true });
  res.send({
    message: "Directory Created Succesfully",
  });
});

//All GET requests
//Enter path in Query params
app.get("/folderStructure", (req, res) => {
  const path = req.query.path;
  console.log(`GET ${path} Folder STRUCTURE ON ${new Date()}`);
  res.json(getFolderStructure(`./uploads/${path}`));
});

//TODO: To get the name of the file to download
//TODO: If whole directory is to be downloaded then use zip and sendFile
app.get("/download", (req, res) => {
  //enter Filename in query params with key=name and value=filename_with_extension
  const path = `C:\\Users\\DELL\\Desktop\\My-space\\VScode-programs\\The-web\\websites\\Node-File-Manipulation\\uploads\\${req.query.name}`;
  res.type(path.split(".").pop());
  res.sendFile(path);
  console.log(`Download File ${path} ON ${new Date()}`);
});

//If a folder is to be downloaded zip it and then send file
app.get("/downloadfolder", (req, res) => {
  const path = process.env.UPLOAD_PATH + `${req.query.name}`;
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = fsExtra.createWriteStream(
    process.env.ROOT_PATH + `zips\\target.zip`
  );
  archive
    .directory(path, false)
    .on("error", (err) => console.error(err))
    .pipe(stream);
  archive.finalize();
  stream.on("close", () => {
    res.type(".zip");
    res.sendFile(
      `C:\\Users\\DELL\\Desktop\\My-space\\VScode-programs\\The-web\\websites\\Node-File-Manipulation\\zips\\target.zip`
    );
    console.log(`Downloaded Zipped Folder at ${path} ON ${new Date()}`);
  });
});

app.listen(PORT, () => {
  console.log("Server started at PORT=" + PORT);
});
