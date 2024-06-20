const express = require("express");
const { generateFile } = require('./generateFile');
const { executeCpp } = require("./executeCpp");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
    return res.json({ hello: "world!" });
});

app.post("/run", async (req, res) => {
    const { language = "cpp", code } = req.body;

    if (!code) {
        return res.status(400).json({ success: false, error: "Empty code body!" });
    }

    try {
        const filepath = await generateFile(language, code);
        const output = await executeCpp(filepath);
        return res.json({ filepath, output });
    } catch (err){
        res.status(500).json({err});
    }
});

const port = 5000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
