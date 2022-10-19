const chokidar = require("chokidar");

const pathToWatch = "./watch-here";

const watcher = chokidar.watch(pathToWatch);

watcher
  .on("add", (path) => console.log(`File ${path} has been added`))
  .on("change", (path) => console.log(`File ${path} has been changed`))
  .on("unlink", (path) => console.log(`File ${path} has been removed`));

// More possible events.
watcher
  .on("addDir", (path) => console.log(`Directory ${path} has been added`))
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
