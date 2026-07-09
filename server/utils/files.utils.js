const { FILE_DEFAULTS } = require("../constants/defaults.contants");

//check file extention
exports.checkFileExtention = (file, extentions) => {
    const type = file.originalFilename.split(".").pop();
    const validTypes = extentions ? extentions : FILE_DEFAULTS.IMAGES;
    if (validTypes.indexOf(type) === -1) {
        return false;
    }
    return true;
};