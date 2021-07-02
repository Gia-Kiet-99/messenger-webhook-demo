const cryptoRandomString = require("crypto-random-string");
const axios = require("axios");

const PAGE_ACCESS_TOKEN = "EAAipH3IPQkQBANq28gre1FL5eNttWyGMIeAIZB1um6RhSW1DgCNde1nZAsTwO11V1oT8Q7mskDH0XPZAdR9NoEAUXLz7vRwsQMriJMhjjJoLNJOfUBaFZAzToVNkXnDfQoXlZA0NAA3tdEmKK5FS99e2qUQ6YYAsSZCLvN7lzmRaAXA5Dme4Elt0UKCwtu4RgL9CRJmgHjfQZDZD";
// console.log(cryptoRandomString(64));

async function handleGetStarted(sender_psid) {
  // Send the HTTP request to the Messenger Platform
  try {
    const res = await axios.get(
      `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name&access_token=${PAGE_ACCESS_TOKEN}`);
    console.log(res);
  } catch (error) {
    console.error(error);
  }
}

handleGetStarted('3697187417053979');