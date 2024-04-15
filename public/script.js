const getCrafts = async () => {
    try {
        return (await fetch("./api/crafts")).json();
    } catch (error) {
        console.log(error);
        return "";
    }
};

const closeModal = () => {
    const overlayLayout = document.getElementById("layout-overlay");
    const modalDiv = document.getElementById("modal-div");
    overlayLayout.classList.add("hidden");
    modalDiv.classList.add("hidden");
};

const getCraft = (craft) => {
    const craftImg = document.createElement("img");
    craftImg.src = "./images/" + craft.image;
    craftImg.onclick = () => {
        const overlayLayout = document.getElementById("layout-overlay");
        const modalDiv = document.getElementById("modal-div");
        modalDiv.innerHTML = "";
        const buttonWrap = document.createElement("p");
        buttonWrap.id = "btn-wrap";
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
                method: "DELETE",
                headers: { "Content-Type": "application/json;charset=utf-8" }
            });
            if (response.status != 200) {
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
        overlayLayout.classList.remove("hidden");
        modalDiv.classList.remove("hidden");
    };
    return craftImg;
};

const showCrafts = async () => {
    const craftsJSON = await getCrafts();
    const craftDiv = document.getElementById("crafts");
    craftDiv.innerHTML = "";
    if (craftsJSON == "") {
        craftDiv.innerHTML = "no more new crafts";
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

const changeImage = (event) => {
    const preview = document.getElementById("preview");
    if (!event.target.files.length) {
        preview.src = "https://place-hold.it/200x300";
        return;
    }
    preview.src = URL.createObjectURL(event.target.files.item(0));
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

const resetForm = () => {
    document.getElementById("craft-form").reset();
    document.getElementById("supplies-list").innerHTML = "";
    document.getElementById("preview").src = "https://place-hold.it/200x300";
    document.getElementById("error").innerHTML = "";
    document.getElementById("error-two").innerHTML = "";
};

const openAddCraft = () => {
    resetForm();
    const overlayLayout = document.getElementById("add-craft-overlay");
    const modalDiv = document.getElementById("add-craft-modal");
    overlayLayout.classList.remove("hidden");
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
    const overlayLayout = document.getElementById("add-craft-overlay");
    const modalDiv = document.getElementById("add-craft-modal");
    overlayLayout.classList.remove("hidden");
    modalDiv.classList.remove("hidden");
};

const closeAddCraft = () => {
    const overlayLayout = document.getElementById("add-craft-overlay");
    const modalDiv = document.getElementById("add-craft-modal");
    overlayLayout.classList.add("hidden");
    modalDiv.classList.add("hidden");
    resetForm();
};

const getSupplies = () => {
    const suppliesInput = document.querySelectorAll("#supplies-list input");
    const supplies = [];
    suppliesInput.forEach((supply) => {
        supplies.push(supply.value);
    });
    return supplies;
};

const submitCraft = async (event) => {
    event.preventDefault();
    const form = document.getElementById("craft-form");
    const formData = new FormData(form);
    formData.append("supplies", getSupplies());
    formData.delete("supply");
    let response;
    if (form._id.value.trim() == "") {
        response = await fetch("/api/crafts", {
            method: "POST",
            body: formData
        });
    } else {
        response = await fetch(`/api/crafts/${form._id.value}`, {
            method: "PUT",
            body: formData,
        });
    }
    if (response.status != 200) {
        document.getElementById("error").innerHTML = "Error adding/editing data";
        document.getElementById("error-two").innerHTML = `${response.status} ${response.statusText}`;
        return;
    }
    await response.json();
    closeAddCraft();
    showCrafts();
};

showCrafts();
document.getElementById("addCraft").onclick = openAddCraft;
document.getElementById("craft-form").onsubmit = submitCraft;
document.getElementById("add-supply").onclick = addSupply;
document.getElementById("image").onchange = changeImage;
document.getElementById("cancel-button").onclick = closeAddCraft;

