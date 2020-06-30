require("dotenv").config();
var { google } = require("googleapis");
var OAuth2 = google.auth.OAuth2;

main();

async function main() {
  const auth = authorize();
  const views = await getVideoViews(auth);
  const title = await updateTitle(auth, views);
  console.log(title);
  setInterval(async () => {
    const auth = authorize();
    const views = await getVideoViews(auth);
    const title = await updateTitle(auth, views);
    console.log(title);
  }, 480000);
}

function authorize() {
  var credentials = JSON.parse(process.env.CLIENT_SECRET);
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  oauth2Client.credentials = JSON.parse(process.env.token);
  return oauth2Client;
}

async function getVideoViews(auth) {
  const service = google.youtube("v3");
  return new Promise((resolve, reject) => {
    service.videos.list(
      {
        auth: auth,
        part: "statistics",
        id: process.env.VIDEO_ID,
      },
      (err, response) => {
        if (err) reject(err);
        else resolve(response.data.items[0].statistics.viewCount);
      }
    );
  });
}

async function updateTitle(auth, views) {
  const service = google.youtube("v3");
  return new Promise((resolve, reject) => {
    service.videos.update(
      {
        auth: auth,
        part: "snippet",
        resource: {
          id: process.env.VIDEO_ID,
          snippet: {
            title: `This video has ${views} views!`,
            categoryId: 27,
          },
        },
      },
      (err, response) => {
        if (err) reject(err);
        else resolve(response.data.snippet.title);
      }
    );
  });
}
