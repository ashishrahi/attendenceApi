const crypto = require("crypto");

const key = Buffer.from("01234567890123456789012345678901"); 
const iv = Buffer.from("0123456789012345"); 


function encryptData(data) {
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return  encrypted;
}


function decryptData(encryptedData, encryptionKey, encryptionIv) {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(encryptionKey, "hex"),
    Buffer.from(encryptionIv, "hex")
  );
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = { encryptData, decryptData };