//TODO: Add function for getting the full file structure
import filesystem from "fs";
const getFolderStructure = (dir) => {
  var results = [];

  filesystem.readdirSync(dir).forEach(function (file) {
    file = dir + "/" + file;
    var stat = filesystem.statSync(file);

    if (stat && stat.isDirectory()) {
      results = results.concat(getFolderStructure(file));
    } else results.push(file);
  });

  return results;
};

export default getFolderStructure;
