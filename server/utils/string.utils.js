//generate password based on caps, smalls and numbers.
export function generateString({ length, capsOnly = false, numbersOnly = false }) {
    length = length ? length : 8;
    let charset =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let retVal = "";
    if (capsOnly) {
        charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }
    if (numbersOnly) {
        charset = "1234567890";
    }
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

export function slugify(string) {
    const slug = string
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");

    return slug
}