const getCrafts = async () => {
	try {
		return (await fetch("./api/crafts")).json();
	} catch (error) {
		console.log(error);
		return "";
	}
};
const getCraft = (craft) => {
	const craft_Img = document.createElement("img");
	craft_Img.src = "./images/" + craft.image;
	craft_Img.onclick = () => {
		const layout = document.getElementById("layout");
		const modalDiv = document.getElementById("craft-modal");
		modalDiv.innerHTML = "";
		const buttonWrap = document.createElement("p");
		buttonWrap.id = "btn";
		const close = document.createElement("button");
		close.onclick = closeModal;
		close.innerHTML = "X";
		buttonWrap.append(close);
		modalDiv.append(buttonWrap);
		const flexDiv = document.createElement("div");
		flexDiv.id = "flex-div";
		const imgDiv = document.createElement("div");
		const flexImg = document.createElement("img");
		flexImg.src = "./images/" + craft.image;
		imgDiv.append(flexImg);
		const textDiv = document.createElement("div");
		const craftH2 = document.createElement("h2");
		craftH2.innerHTML = craft.name;
		const editButton = document.createElement("button");
		editButton.id = "edit-button";
		editButton.innerHTML = "&#9998;";
		editButton.onclick = (event) => {
			event.preventDefault();
			closeModal();
			openEditCraft(craft);
		};
		craftH2.append(editButton);
		const deleteButton = document.createElement("button");
		deleteButton.id = "delete-button";
		deleteButton.innerHTML = "&#128465;";
		deleteButton.onclick = async (event) => {
			event.preventDefault();
			let response = await fetch(`/api/crafts/${craft._id}`, {
				method:"DELETE",
				headers:{"Content-Type":"application/json;charset=utf-8"}
			});
			if(response.status != 200){
				console.log("Error deleting");
				return;
			}
			let result = await response.json();
			showCrafts();
			closeModal();
		};
		craftH2.append(deleteButton);
		textDiv.append(craftH2);
		const descP = document.createElement("p");
		descP.innerHTML = craft.description;
		textDiv.append(descP);
		const craftH3 = document.createElement("h3");
		craftH3.innerHTML = "Supplies:";
		textDiv.append(craftH3);
		const list = document.createElement("ul");
		craft.supplies.forEach((supply) => {
			const item = document.createElement("li");
			item.innerHTML = supply;
			list.appendChild(item);
		});
		textDiv.append(list);
		flexDiv.append(imgDiv);
		flexDiv.append(textDiv);
		modalDiv.append(flexDiv);
		
		layout.classList.remove("hidden");
		modalDiv.classList.remove("hidden");
	};
	return craft_Img;
};
const closeModal = () => {
	const overlay = document.getElementById("layout");
	const modalDiv = document.getElementById("craft-modal");
	overlay.classList.add("hidden");
	modalDiv.classList.add("hidden");
};
const showCrafts = async () => {
	const craftsJSON = await getCrafts();
	const craftDiv = document.getElementById("crafts");
	craftDiv.innerHTML = "";
	if (craftsJSON == "") {
		craftDiv.innerHTML = "There's no more crafts";
		return;
	}
	let count = 0;
	let column = document.createElement("div");
	column.classList.add("column");
	craftsJSON.forEach((craft) => {
		column.append(getCraft(craft));
		count++;
		if (count > 6) {
			craftDiv.append(column);
			column = document.createElement("div");
			column.classList.add("column");
			count = 0;
		}
	});
	craftDiv.append(column);
};
const getSupplies = () => {
	const suppliesInput = document.querySelectorAll("#supplies-list input");
	const supplies = [];
	suppliesInput.forEach((supply) => {
		supplies.push(supply.value);
	});
	return supplies;
};
const addSupply = (event) => {
	event.preventDefault();
	const supplyGet = document.getElementById("supply");
	const suppliesList = document.getElementById("supplies-list");
	const supplyInput = document.createElement("input");
	supplyInput.type = "text";
	supplyInput.value = supplyGet.value;
	const wrap = document.createElement("p");
	wrap.append(supplyInput);
	suppliesList.append(wrap);
	supplyGet.value = "";
};


const changeImage = (event) => {
	const preview = document.getElementById("preview");
	if (!event.target.files.length) {
		preview.src = "https://place-hold.it/200x300";
		return;
	}
	preview.src = URL.createObjectURL(event.target.files.item(0));
};


const resetForm = () => {
	document.getElementById("craft-form").reset();
	document.getElementById("supplies-list").innerHTML = "";
	document.getElementById("preview").src = "https://place-hold.it/200x300";
	document.getElementById("error").innerHTML = "";
	document.getElementById("errors").innerHTML = "";
};

const openAddCraft = () => {
	resetForm();
	const overlay = document.getElementById("add-craft-layout");
	const modalDiv = document.getElementById("add-craft-modal");
	overlay.classList.remove("hidden");
	modalDiv.classList.remove("hidden");
};

const openEditCraft = (craft) => {
	resetForm();
	const form = document.getElementById("craft-form");
	form._id.value = craft._id;
	form.name.value = craft.name;
	form.description.value = craft.description;
	document.getElementById("preview").src = "images/" + craft.image;
	const suppliesList = document.getElementById("supplies-list");
	craft.supplies.forEach((supply) => {
		const supplyInput = document.createElement("input");
		supplyInput.type = "text";
		supplyInput.value = supply;
		suppliesList.append(supplyInput);
	});
	const overlay = document.getElementById("add-craft-layout");
	const modalDiv = document.getElementById("add-craft-modal");
	overlay.classList.remove("hidden");
	modalDiv.classList.remove("hidden");
};

const closeAddCraft = () => {
	const overlay = document.getElementById("add-craft-layout");
	const modalDiv = document.getElementById("add-craft-modal");
	overlay.classList.add("hidden");
	modalDiv.classList.add("hidden");
	resetForm();
};



const submitCraft = async (event) => {
	event.preventDefault();
	const form = document.getElementById("craft-form");
	const formData = new FormData(form);
	formData.append("supplies", getSupplies());
	formData.delete("supply");
	let response = null;
	try {
		if (form._id.value.trim() === "") {
			response = await fetch("/api/crafts", {
				method: "POST",
				body: formData
			});
		} else {
			console.log("put");
			response = await fetch(`/api/crafts/${form._id.value}`, {
				method: "PUT",
				body: formData,
			});
		}
		if (response.status !== 200) {
			throw new Error("Error data input");
		}
		await response.json();
		closeAddCraft();
		showCrafts();
	} catch (error) {
		document.getElementById("error").innerHTML = error.message;
	}
};

showCrafts();
document.getElementById("cancel").onclick = closeAddCraft;
document.getElementById("addCraft").onclick = openAddCraft;
document.getElementById("add-supply").onclick = addSupply;
document.getElementById("craft-form").onsubmit = submitCraft;
document.getElementById("image").onchange = changeImage;

