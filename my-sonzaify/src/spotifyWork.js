import express from "express";
import request from "request";
var client_id = "2c44fa46772d42b3bc909846f3e146a2";
var redirect_uri =
  "https://sonzaify-406a163pv-brandonb77706s-projects.vercel.app/callback";

const generateRandomString = (length) => {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

var app = express();

app.get("/login", function (req, res) {
  var state = generateRandomString(16);
  var scope = "user-read-private user-read-email";

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});

var client_secret = "5033ef38d95941bf9de0a0799a0c5800";

var authOptions = {
  url: "https://accounts.spotify.com/api/token",
  headers: {
    Authorization:
      "Basic " +
      new Buffer.from(client_id + ":" + client_secret).toString("base64"),
  },
  form: {
    grant_type: "client_credentials",
  },
  json: true,
};

request.post(authOptions, function (error, response, body) {
  if (!error && response.statusCode === 200) {
    console.log("Full JSON Response:", body); // Log the full JSON response
    var token = body.access_token;
    console.log("Access Token:", token); // Log the access token separately
  } else {
    console.error("Error:", error); // Log any errors
    console.error("Response:", response && response.statusCode); // Log the status code
    console.error("Body:", body); // Log the body in case of an error
  }
});
