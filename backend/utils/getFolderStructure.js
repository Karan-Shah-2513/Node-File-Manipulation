//TODO: Add function for getting the full file structure
import filesystem from "fs";
import path from "path";
/*
Returns an array of objects containing paths of all the folders and files in the main directory
*/
const getFolderStructure = (dir) => {
  let results = [];

  filesystem.readdirSync(dir).forEach(function (file) {
    let obj = {};
    file = path.join(dir, file);
    obj.path = file;
    const stat = filesystem.statSync(file);

    if (stat && stat.isDirectory()) {
      results.push(obj);
      obj.isDirectory = true;
      results = results.concat(getFolderStructure(file));
    } else {
      obj.isDirectory = false;
      results.push(obj);
    }
  });

  return results;
};

export default getFolderStructure;
