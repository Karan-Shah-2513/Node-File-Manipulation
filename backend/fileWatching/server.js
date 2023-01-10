const chokidar = require("chokidar");
const fs = require("fs");
const fsExtra = require("fs-extra");

const pathToWatch = "./watch-here";
const watcher = chokidar.watch(pathToWatch);

watcher
  .on("add", (path) => {
    console.log(`File ${path} has been added`);
    // console.log("Now moving the file to universe");
    // // fs.copyFile();

    // const fileExtension = path.split(".").pop();
    // const fileName = path.split("\\").pop();
    // fsExtra.move(path, `./universe/${fileName}`, (err) => {
    //   console.error(err);
    // });
  })
  .on("change", (path) => console.log(`File ${path} has been changed`))
  .on("unlink", (path) => console.log(`File ${path} has been removed`));

// More possible events.
watcher
  .on("addDir", (path) => {
    console.log(`Directory ${path} has been added`);
    setTimeout(() => {
      if (path != "watch-here") {
        const name = path.split("\\").pop();
        console.log(path);
        console.log(path + "/" + name);
        fsExtra.move(path, `./universe/${name}`, (err) => {
          console.error(err);
        });
      }
    }, 10000);
  })
  .on("unlinkDir", (path) => console.log(`Directory ${path} has been removed`))
  .on("error", (error) => console.log(`Watcher error: ${error}`))
  .on("ready", () => console.log("Initial scan complete. Ready for changes"))
  .on("raw", (event, path, details) => {
    // internal
    console.log("Raw event info:", event, path, details);
  });

// 'add', 'addDir' and 'change' events also receive stat() results as second
// argument when available: https://nodejs.org/api/fs.html#fs_class_fs_stats
watcher.on("change", (path, stats) => {
  if (stats) console.log(`File ${path} changed size to ${stats.size}`);
});
