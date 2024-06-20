const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "userData.db");

let db;

const initialiseDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at PORT 3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initialiseDbAndServer();

// api 1
app.post("/register", async (req, res) => {
  const { username, name, password, gender, location } = req.body;
  console.log(req.body);
  const hashedPW = await bcrypt.hash(password, 10);
  const userExists = `
      select * from user
      where username = '${username}';`;
  const userObj = await db.get(userExists);

  if (userObj === undefined) {
    if (password.length < 5) {
      res.status(400);
      res.send("Password is too short");
    } else {
      const createUser = `
              INSERT INTO user(username,name,password,gender,location)
              values('${username}','${name}','${hashedPW}','${gender}','${location}');`;
      await db.run(createUser);
      res.status(200);
      res.send("User created successfully");
    }
  } else {
    res.status(400);
    res.send("User already exists");
  }
});

//api 2
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const userExists = `
      select * from user
      where username = '${username}';`;
  const userObj = await db.get(userExists);

  if (userObj === undefined) {
    res.status(400);
    res.send("Invalid user");
  } else {
    const verifyPW = await bcrypt.compare(password, userObj.password);
    if (verifyPW === true) {
      res.status(200);
      res.send("Login success!");
    } else {
      res.status(400);
      res.send("Invalid password");
    }
  }
});

// api 3
app.put("/change-password", async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  const userExists = `
      select * from user
      where username = '${username}';`;
  const userObj = await db.get(userExists);

  const verifyPW = await bcrypt.compare(oldPassword, userObj.password);

  if (userObj !== undefined) {
    if (verifyPW === false) {
      res.status(400);
      res.send("Invalid current password");
    } else {
      if (newPassword.length < 5) {
        res.status(400);
        res.send("Password is too short");
      } else {
        res.status(200);
        res.send("Password updated");
      }
    }
  }
});



// const express = require("express");
// const app = express();
// app.use(express.json());
// const path = require("path");
// const sqlite3 = require("sqlite3");
// const { open } = require("sqlite");
// const bcrypt = require("bcrypt");

// const dbPath = path.join(__dirname, "userData.db");

// let db;

// const initialiseServar = async () => {
//   try {
//     db = await open({
//       filename: dbPath,
//       driver: sqlite3.Database,
//     });
//     app.listen(3000, () => {
//       console.log("server running at 3000");
//     });
//   } catch (e) {
//     console.log(`DB ERROR: ${e.message}`);
//     process.exit(1);
//   }
// };

// initialiseServar();

// // API 1

// app.post("/register", async (req, res) => {
//   try {
//     const registerBody = req.body;
//     const { username, name, password, gender, location } = registerBody;
//     // console.log(registerBody);
//     const hashedPW = await bcrypt.hash(password, 10);
//     // console.log(hashedPW);
//     const verifyingUserExistance = `
//   SELECT * FROM user WHERE username='${username}';`;
//     const verifyUserRes = await db.get(verifyingUserExistance);
//     // console.log(verifyUserRes);
//     if (verifyUserRes !== undefined) {
//       res.status = 400;
//       res.send("User already exists");
//     } else if (password.length < 5) {
//       res.status = 400;
//       res.send("Password is too short");
//     } else {
//       const registerApiPostQuery = `
//         INSERT INTO user(username,name,password,gender,location)
//         VALUES('${username}','${name}','${hashedPW}','${gender}','${locaion}');`;
//       const registerApiRes = await db.run(registerApiPostQuery);
//       res.status(200);
//       res.send("User created successfully");
//     }
//   } catch (e) {
//     console.log(`POST ERROR: ${e.message}`);
//   }
// });

// module.exports = app;
