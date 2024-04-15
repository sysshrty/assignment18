const getCrafts = async () => {
	try {
		return (await fetch("./api/crafts")).json();
	} catch (error) {
		console.log(error);
		return "";
	}
};
const createCraftCard = (craft) => {
    const card = document.createElement("div");
    card.classList.add("craft-card");
    
    const image = document.createElement("img");
    image.src = "./images/" + craft.image;
    image.alt = craft.name;
    image.addEventListener("click", () => openCraftModal(craft));
    
    const name = document.createElement("h2");
    name.textContent = craft.name;

    const editButton = createButton("edit-button", "&#9998;", () => openEditCraft(craft));
    const deleteButton = createButton("delete-button", "&#128465;", () => deleteCraft(craft));

    const description = document.createElement("p");
    description.textContent = craft.description;

    const suppliesHeader = document.createElement("h3");
    suppliesHeader.textContent = "Supplies:";

    const suppliesList = document.createElement("ul");
    craft.supplies.forEach((supply) => {
        const item = document.createElement("li");
        item.textContent = supply;
        suppliesList.appendChild(item);
    });

    card.appendChild(image);
    card.appendChild(name);
    card.appendChild(editButton);
    card.appendChild(deleteButton);
    card.appendChild(description);
    card.appendChild(suppliesHeader);
    card.appendChild(suppliesList);

    return card;
};

const createButton = (id, text, onClick) => {
    const button = document.createElement("button");
    button.id = id;
    button.innerHTML = text;
    button.addEventListener("click", onClick);
    return button;
};

const openCraftModal = (craft) => {
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

    const craftCard = createCraftCard(craft);
    modalDiv.appendChild(craftCard);

    layout.classList.remove("hidden");
    modalDiv.classList.remove("hidden");
};

const deleteCraft = async (craft) => {
    try {
        let response = await fetch(`/api/crafts/${craft._id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json;charset=utf-8" }
        });
        if (response.status !== 200) {
            throw new Error("Error deleting");
        }
        let result = await response.json();
        showCrafts();
        closeModal();
    } catch (error) {
        console.error("Error deleting craft:", error);
    }
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

        if (!response.ok) {
            throw new Error("Error: " + response.statusText);
        }

        const result = await response.json();
        closeAddCraft();
        showCrafts();
    } catch (error) {
        document.getElementById("error").textContent = error.message;
        console.error("Error:", error);
    }
};


showCrafts();
document.getElementById("cancel").onclick = closeAddCraft;
document.getElementById("addCraft").onclick = openAddCraft;
document.getElementById("add-supply").onclick = addSupply;
document.getElementById("craft-form").onsubmit = submitCraft;
document.getElementById("image").onchange = changeImage;

