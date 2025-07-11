const express = require("express");
const app = express();
const Feed = require("./model/feed");
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const mongoose = require("mongoose");

// Connect to MongoDB (only once when the server starts)----------
mongoose.connect("mongodb://localhost:27017/my_first_db").then(() =>
    console.log(chalk.bgHex("#b2ebf2").black.bold(" ⛅ MongoDB Connected ⛅ "))).catch(console.error);
//codigo de guardado de ejemplo
/* const sampleFeed = new Feed({
    content: "This is my first SNS feed!",
    author: "TEST_USER",});
sampleFeed
    .save()
    .then(() => console.log("✅ Test fed saved"))
    .catch((err) => console.error("❌ Error:", err)); */
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const chalk = require("chalk");
//añadimos morgan
const morgan = require("morgan");
//añadimos cookie-parser
//const cokkieParser = require("cookie-parser");
//instalamos session express
const session = require("express-session");

const path = require("path");


//---------uso de session-----------------

app.use(morgan("common"));
//app.use(cokkieParser());

app.use(
    session({
        secret: "holaMundoSecreto",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 10,
        }, //5minutos
    })
);
//necesario para usar parametros del body
app.use(express.urlencoded({ extended: true }));

//-----------------plantilla----------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
//-----------------------------------------

//app.get("/set",(req,res)=>{
//    res.cookie("username","jhonn",{maxAge:60000});
//    res.send("cookie set !!!");
//});
//
//app.get("/set",(req,res)=>{
//    res.send(req.cookies);
//});
//app.get("/login",(req,res)=>{
//    req.session.username="jhonn";
//    res.send("login sucess!!!");
//});

//------------LOGIN DE SESSION-------------
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    //autentications
    const mockUsername = "jhonn"
    const mockPassword = "12345"

    if (username === mockUsername && password === mockPassword) {
        req.session.username = username;
        res.redirect("/posts");
    } else {
        res.send("Login falled");
    }

});

app.get("/perfil", (req, res) => {
    if (req.session.username) {
        res.send('Hello ' + req.session.username);
    } else {
        res.send("please login first");
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send("Error logging out :(");
        }
        res.clearCookie("connect.sid");
        res.send("Session cerrada con exito :)");
    });
});


//------Estilos y jcripts-----------------

app.use("/css", express.static(path.join(__dirname, "public", "css")));

app.use("/js", express.static(path.join(__dirname, "public", "js")));

//-----------------------------------------

//---------------rutas---------------------
app.get("/", (req, res) => {
    //res.send("WELCOME TO MINI SNS!!!");
    //res.sendFile(path.join(__dirname, "public", "index.html"));

    res.render("index", { username: req.session.username });

});

app.get("/write", (req, res) => {
    //res.send("write a new post");
    if (req.session.username) {
        //res.sendFile(path.join(__dirname, "public", "write.html"));
        res.render("write");
    } else {
        res.redirect("/");
    }
});
// ruta especialpara mandar datos a la base de datos----------------------
app.post("/write", async (req, res) => {
    const { content } = req.body;
    if (!req.session.username) {
        return res.redirect("/");
    }
    const newFeed = new Feed({
        content,
        author: req.session.username,
    });
    // Save the new feed to the database
    // and redirect to the posts page
    await newFeed
        .save()
        .then(() => {
            console.log("Feed saved successfully💹");
            res.redirect("/posts");
        })
        .catch((err) => {
            console.error("Error saving feed❌", err);
            res.status(500).send("Error saving feed❌");
        });
});
//--------------Ruta para mostrar los datos de la base de datos----
/* app.get("/posts", (req, res) => {
    //res.send("here are the post ");
    const posts = [
        { username: "jhonn", content: "hello my name is jhonn is first posts" },
        { username: "Maria", content: "hello happ day" },
        { username: "Carlos", content: "Good night" },
        { username: "Fernanda", content: "hello i like is this pagina web" },
        { username: "Luz", content: "This is Great" },
    ];
    if (req.session.username) {
        // res.sendFile(path.join(__dirname, "public", "posts.html"));
        res.render("posts", { posts });
    } else {
        res.redirect("/");
    }
}); */
app.get("/posts", async (req, res) => {
    if (!req.session.username) {
        return res.redirect("/");
    }
    try {
        const posts = await Feed.find({
            author:req.session.username
        }).sort({
            createdAt: -1,
        }); // sort by createdAt in descending order.
        res.render("posts", { posts });
    } catch (error) {
        console.error("Error loading posts", err);
        res.status(500).send("Error loading posts");
    }
});
//---------------para la consola--------------------------------
app.listen(3000, () => {
    console.log(
        chalk.bgHex("#ff69b4").white.bold(" SERVIDOR EXPRES INICIADO")
    );
    console.log(
        chalk.green("running at:") + chalk.cyan(
            "Server is running on http://localhost:3000"));
    console.log(chalk.gray("precione Ctrl+C para apagar el servidor"));
});