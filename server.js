const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");
//showed
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./public/images/");
	},
	filename: (req, file, cb) => {
		cb(null, file.originalname);
	},
});

const upload = multer({ storage: storage });

mongoose
  .connect("mongodb+srv://sbegay:shryb101@cluster0.6mrmfhk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => { 
    console.log("connected to Mongodb");
  })
  .catch((error) => {
    console.log("no connection to Mongodb", error);
  });

  const craftSchema = new mongoose.Schema({
	name: String,
	description: String,
	supplies: [String],
	image: String
});
const Craft = mongoose.model("Craft", craftSchema);

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

app.get("/api/crafts", async (req, res) => {
	res.send(await Craft.find());
});

app.put("/api/crafts/:id", async (req, res) => {
	try {
	  const result = validateCraft(req.body);
	  if (result.error) {
		return res.status(400).send(result.error.details[0].message);
	  }
  
	  const id = req.params.id;
	  let craft = await Craft.findById(id);
	  if (!craft) {
		return res.status(404).send("Craft not found");
	  }
  
	  // Update craft fields
	  craft.name = req.body.name;
	  craft.description = req.body.description;
	  craft.supplies = req.body.supplies.split(",");
	  if (req.file) {
		craft.image = req.file.filename;
	  }
  
	  // Save updated
	  await craft.save();
  
	  // Send
	  res.send(craft);
	} catch (error) {
	  console.error("Error updating craft:", error);
	  res.status(500).send("Internal server error");
	}
  });
  
  

app.put("/api/crafts/:id", upload.single("image"), async (req, res) => {
	const result = validateCraft(req.body);
	if (result.error) {
		res.status(400).send(result.error.details[0].message);
		return;
	}
	let updateFields = {
		name: req.body.name,
		description: req.body.description,
		supplies: req.body.supplies.split(",")
	};
	if (req.file) {
		updateFields.image = req.file.filename;
	}
	const id = req.params.id;
	res.send(await Craft.updateOne({_id:id},updateFields));
});
  
app.delete("/api/crafts/:id", upload.single("image"), async (req, res) => {
	res.send(await Craft.findByIdAndDelete(req.params.id));
});
  

  
  app.listen(3000, () => {
    console.log("requesting infomation...");
  });