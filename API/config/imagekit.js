const crypto = require("crypto");
const https = require("https");
const dotenv = require("dotenv");

dotenv.config();

const PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY || "public_/PfWSDFtqlaMUzirk/U1+hFG5IM=";
const PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || "private_QugDN74pUlsdvKYLK3h6aydGtTc=";
const URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/dios87u67";

/**
 * Generate authentication parameters for client-side direct upload to ImageKit
 */
function getAuthenticationParameters(token, expire) {
  const defaultToken = token || crypto.randomBytes(16).toString("hex");
  const defaultExpire = expire || Math.floor(Date.now() / 1000) + 1800; // 30 mins valid

  const signature = crypto
    .createHmac("sha1", PRIVATE_KEY)
    .update(defaultToken + defaultExpire)
    .digest("hex");

  return {
    token: defaultToken,
    expire: defaultExpire,
    signature: signature,
    publicKey: PUBLIC_KEY,
    urlEndpoint: URL_ENDPOINT
  };
}

/**
 * Upload image (Base64 data string, binary buffer, or remote image URL) directly to ImageKit REST API
 */
function uploadImage(fileData, fileName, folder = "/pets") {
  return new Promise((resolve, reject) => {
    if (!fileData) {
      return reject(new Error("File data or image URL is required."));
    }

    const name = fileName || "image_" + Date.now() + ".jpg";
    const authHeader = "Basic " + Buffer.from(PRIVATE_KEY + ":").toString("base64");

    const boundary = "----ImageKitBoundary" + Math.random().toString(36).substring(2);
    let postData = "";

    // file field
    postData += "--" + boundary + "\r\n";
    postData += 'Content-Disposition: form-data; name="file"\r\n\r\n';
    postData += fileData + "\r\n";

    // fileName field
    postData += "--" + boundary + "\r\n";
    postData += 'Content-Disposition: form-data; name="fileName"\r\n\r\n';
    postData += name + "\r\n";

    // folder field
    postData += "--" + boundary + "\r\n";
    postData += 'Content-Disposition: form-data; name="folder"\r\n\r\n';
    postData += folder + "\r\n";

    // useUniqueFileName field
    postData += "--" + boundary + "\r\n";
    postData += 'Content-Disposition: form-data; name="useUniqueFileName"\r\n\r\n';
    postData += "true\r\n";

    postData += "--" + boundary + "--\r\n";

    const options = {
      hostname: "upload.imagekit.io",
      port: 443,
      path: "/api/v1/files/upload",
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "multipart/form-data; boundary=" + boundary,
        "Content-Length": Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = "";
      res.on("data", (chunk) => responseBody += chunk);
      res.on("end", () => {
        try {
          const json = JSON.parse(responseBody);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(json.message || "ImageKit upload failed with status " + res.statusCode));
          }
        } catch (e) {
          reject(new Error("Failed to parse ImageKit response: " + responseBody));
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Delete file from ImageKit by fileId
 */
function deleteImage(fileId) {
  return new Promise((resolve, reject) => {
    if (!fileId) return reject(new Error("fileId is required"));

    const authHeader = "Basic " + Buffer.from(PRIVATE_KEY + ":").toString("base64");
    const options = {
      hostname: "api.imagekit.io",
      port: 443,
      path: "/v1/files/" + fileId,
      method: "DELETE",
      headers: {
        "Authorization": authHeader
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = "";
      res.on("data", (chunk) => responseBody += chunk);
      res.on("end", () => {
        resolve({ success: res.statusCode === 204 || res.statusCode === 200 });
      });
    });

    req.on("error", (err) => reject(err));
    req.end();
  });
}

module.exports = {
  publicKey: PUBLIC_KEY,
  privateKey: PRIVATE_KEY,
  urlEndpoint: URL_ENDPOINT,
  getAuthenticationParameters,
  uploadImage,
  deleteImage
};
