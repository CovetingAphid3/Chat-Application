// Server-side code
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors({ origin: true }));

app.post("/authenticate", async (req, res) => {
  const { username, password } = req.body;

  try {
    const r = await axios.put(
      "https://api.chatengine.io/users/",
      {
        username: username,
        secret: password, // Set the secret to the password value
        first_name: username,
      },
      { headers: { "private-key": "a7c09654-a412-4b21-878a-d53821af1276" } }
    );
    return res.status(r.status).json(r.data);
  } catch (e) {
    return res.status(e.response.status).json(e.response.data);
  }
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
