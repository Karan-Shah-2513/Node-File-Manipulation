const express = require("express");
const formidable = require("formidable");
const fsExtra = require("fs-extra");

const app = express();
const PORT = 8000;

function getName(oldName) {
  console.log("Oldname: " + oldName);
  const allFiles = fsExtra
    .readdirSync(
      "C:\\Users\\DELL\\Desktop\\My-space\\VScode-programs\\The-web\\websites\\Node-File-Manipulation\\uploads\\",
      { withFileTypes: true }
    )
    .filter((item) => !item.isDirectory())
    .map((item) => item.name);

  console.log("All files = " + allFiles);
  //TODO: Add Support for file names which contain two extensions such as Karan.docx.pdf
  if (allFiles.includes(oldName)) {
    const name = oldName.split(".");
    oldName = name[0] + "$." + name[name.length - 1];
    console.log("Checking for newname " + oldName);
    return getName(oldName);
  }
  return oldName;
}

app.post("/upload", (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    const oldpath = files.fileupload.filepath;
    const newpath = `C:\\Users\\DELL\\Desktop\\My-space\\VScode-programs\\The-web\\websites\\Node-File-Manipulation\\uploads\\${getName(
      files.fileupload.originalFilename
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
      }' TO UPLOADS on ${Date.now()}`
    );
    res.json({
      message: "File Uploaded Successfully",
    });
  });
});

//TODO: To get the name of the file to download
//TODO: If whole directory is to be downloaded then use zip and sendFile
app.get("/download/", (req, res) => {
  const path =
    "C:\\Users\\DELL\\Desktop\\My-space\\VScode-programs\\The-web\\websites\\Node-File-Manipulation\\uploads\\";
  const allFiles = fsExtra
    .readdirSync(path, { withFileTypes: true })
    .filter((item) => !item.isDirectory())
    .map((item) => item.name);
  res.type(allFiles[0].split(".").pop());
  res.sendFile(path + `${allFiles[0]}`);
});

app.listen(PORT, () => {
  console.log("Server started at PORT=" + PORT);
});
