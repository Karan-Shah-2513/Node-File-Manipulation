import express from "express";
import getFolderStructure from "./utils/getFolderStructure.js";
import formidable from "formidable";
import fsExtra from "fs-extra";
import dotenv from "dotenv";
import archiver from "archiver";
import path from "node:path";
import { mkdir, mkdirSync, readdir } from "node:fs";
dotenv.config();
const app = express();
const PORT = 8000;

const router = express.Router();
app.use("/api/v1", router);

const uploadPath = path.join(process.cwd(), "/..", "/uploads");
console.log(uploadPath);
// readdir(process.cwd(), (err, files) => {
//   if (err) {
//     console.log(err);
//   } else {
//     let isUploadsThere = false;
//     files.forEach((file) => {
//       if (file === "uploads") {
//         isUploadsThere = true;
//       }
//     });
//     if (!isUploadsThere) {
//       mkdir(uploadPath, (err) => {
//         console.log("Upload path created");
//       });
//     }
//   }
// });

//function to handle the case when the file you are uploading already exists
function getName(oldName, directory) {
  console.log("Oldname: " + oldName);
  const allFiles = fsExtra
    .readdirSync(`${uploadPath}\\${directory}`, {
      withFileTypes: true,
      recursive: true,
    })
    .filter((item) => !item.isDirectory())
    .map((item) => item.name);

  console.log("All files = " + allFiles);
  //TODO: Add Support for file names which contain two extensions such as Karan.docx.pdf
  if (allFiles.includes(oldName)) {
    const name = oldName.split(".");
    const newName = name[0] + "$." + name[name.length - 1];
    console.log("Name Already Exists\nChecking for newname " + newName + "\n");
    return getName(newName, directory);
  }
  return oldName;
}

//All Post requests
//Upload a file to specific folder
/** Give the path to that specific directory in query such as
 * haila\\folder1
 * haila\\ESE sem 1
 */
router.post("/upload", (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    // const directoryPath = `${fields.path}`;
    const oldpath = files.fileupload.filepath;
    const newpath = path.join(__dirname, getName());
    // const newpath = `C:\\Users\\DELL\\Desktop\\My-space\\VScode-programs\\The-web\\websites\\Node-File-Manipulation\\uploads\\${getName(
    //   files.fileupload.originalFilename,
    //   directoryPath
    // )}`;
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
    if (err) {
      console.log(err);
      res.json({
        message: "Error Occured",
        error: err,
      });
    }
  });
});

router.post("/createDirectory", (req, res) => {
  const name = req.query.name;
  const dirPath = path.join(process.cwd(), "/..", "/uploads", name);
  // const path = `C:\\Users\\DELL\\Desktop\\My-space\\VScode-programs\\The-web\\websites\\Node-File-Manipulation\\uploads\\${name}`;
  fsExtra.mkdirSync(dirPath, { recursive: true });
  res.send({
    message: "Directory Created Succesfully",
  });
});

//All GET requests
//Enter path in Query params
router.get("/folderStructure", (req, res) => {
  // const path = req.query.path;
  console.log(`GET Folder STRUCTURE ON ${new Date()}`);
  res.json(
    getFolderStructure(`${path.join(process.cwd(), "/..", "/uploads")}`)
  );
});

//Downloads a file by its path
router.get("/download", (req, res) => {
  //enter FilePath in query params with key=name and value=filename_with_extension
  const downloadPath = path.join(uploadPath, req.query.name);
  // const path = `C:\\Users\\DELL\\Desktop\\My-space\\VScode-programs\\The-web\\websites\\Node-File-Manipulation\\uploads\\${req.query.name}`;
  res.type(downloadPath.split(".").pop());
  res.sendFile(downloadPath);
  console.log(`Download File ${downloadPath} ON ${new Date()}`);
});

//If a folder is to be downloaded zip it and then send file
router.get("/downloadfolder", (req, res) => {
  const folderPath = path.join(uploadPath, req.query.name);
  // const path = uploadPath + `${req.query.name}`;
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = fsExtra.createWriteStream(
    process.env.ROOT_PATH + `zips\\target.zip`
  );
  archive
    .directory(folderPath, false)
    .on("error", (err) => console.error(err))
    .pipe(stream);
  archive.finalize();
  stream.on("close", () => {
    res.type(".zip");
    res.sendFile(`${path.join(process.cwd(), "/..", "/zips", "target.zip")}`);
    console.log(`Downloaded Zipped Folder at ${folderPath} ON ${new Date()}`);
  });
});

app.listen(PORT, () => {
  console.log("Server started at PORT=" + PORT);
});
