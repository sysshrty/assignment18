const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
const mongoose = require("mongoose");
const cors = require("cors");

// MongoDB
mongoose
  .connect("mongodb+srv://sbegay:shryb101@cluster0.6mrmfhk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => { 
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("No connection to MongoDB", error);
  });

//Schema
const craftSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  supplies: { type: [String], required: true },
  image: { type: String, required: true }
});

const Craft = mongoose.model("Craft", craftSchema);

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(cors());

// Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

// Joi
const validateCraft = (craft) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    supplies: Joi.array().items(Joi.string()).required(),
    image: Joi.string().required()
  });
  return schema.validate(craft);
};

// Routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/api/crafts", async (req, res) => {
  try {
    const crafts = await Craft.find();
    res.send(crafts);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

app.post("/api/crafts", upload.single("image"), async (req, res) => {
  try {
    const { error } = validateCraft(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    if (!req.file) return res.status(400).send("No Image File Found");

    const craft = new Craft({
      name: req.body.name,
      description: req.body.description,
      supplies: req.body.supplies,
      image: req.file.filename
    });
    await craft.save();
    res.send(craft);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

app.put("/api/crafts/:id", upload.single("image"), async (req, res) => {
  try {
    const { error } = validateCraft(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const id = req.params.id;
    let craft = await Craft.findById(id);
    if (!craft) return res.status(404).send("Craft not found");

    // Update craft area
    craft.name = req.body.name;
    craft.description = req.body.description;
    craft.supplies = req.body.supplies;
    if (req.file) craft.image = req.file.filename;

    //save updated crafts
    await craft.save();

    res.send(craft);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

app.delete("/api/crafts/:id", async (req, res) => {
  try {
    const craft = await Craft.findByIdAndDelete(req.params.id);
    if (!craft) return res.status(404).send("Craft not found");

    res.send(craft);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

app.listen(3000, () => {
  console.log("Server is running...");
});
