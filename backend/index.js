const express = require("express");
const { generateFile } = require('./generateFile');
const { executeCpp } = require("./executeCpp");
const { executePy } = require("./executePy");
const cors = require("cors");
const mongoose = require('mongoose');
const Job = require("./models/Job");


mongoose.connect("mongodb://localhost/compilerapp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, (err)=> {
    if(err){
        console.error(err);
        process.exit(1);
    }
    console.log("Successfully connected to mongodb database!");
});

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
    return res.json({ hello: "world!" });
});

app.post("/run", async (req, res) => {
    const { language = "cpp", code } = req.body;
    console.log(language, code.length);
    if (code === undefined) {
        return res.status(400).json({ success: false, error: "Empty code body!" });
    }

    try {
        const filepath = await generateFile(language, code);
        const job = await new Job({language, filepath}).save() ;

        let output;

        if(language === "cpp"){
            output = await executeCpp(filepath);
        }else{
            output = await executePy(filepath);
        }

        return res.json({ filepath, output });
    } catch (err){
        res.status(500).json({err});
    }
});

const port = 5000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
