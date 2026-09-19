const vehicleLibrary = {
    ford: [
        {
            name: "Ford One",
            folder: "img/ford/fordOne/",
            images: [
                "image0.jpg",
                "image1.png",
                "image2.jpg"
            ]
        }
    ]
};

const brandSelect = document.getElementById("brandSelect");
const galleryModal = document.getElementById("galleryModal");
const galleryContent = document.getElementById("galleryContent");
const galleryTitle = document.getElementById("galleryTitle");
const backButton = document.getElementById("backButton");
const closeButton = document.getElementById("closeButton");
const imageModal = document.getElementById("imageModal");
const fullSizeImage = document.getElementById("fullSizeImage");
const closeImageButton = document.getElementById("closeImageButton");

let currentBrand = null;
let currentVehicle = null;

brandSelect.addEventListener("change", function () {
    const selectedBrand = brandSelect.value;

    if (selectedBrand === "") {
        return;
    }

    openBrandGallery(selectedBrand);
    brandSelect.value = "";
});

function openBrandGallery(brand) {
    currentBrand = brand;
    currentVehicle = null;

    galleryModal.classList.add("active");

    galleryTitle.textContent =
        capitalizeFirstLetter(brand) + " Vehicles";

    backButton.style.visibility = "hidden";
    galleryContent.innerHTML = "";

    const vehicles = vehicleLibrary[brand];

    vehicles.forEach(vehicle => {
        const item = document.createElement("div");
        item.classList.add("galleryItem");

        const image = document.createElement("img");
        image.src = vehicle.folder + vehicle.images[0];
        image.alt = vehicle.name;

        const name = document.createElement("p");
        name.textContent = vehicle.name;

        item.appendChild(image);
        item.appendChild(name);
        galleryContent.appendChild(item);

        item.addEventListener("click", function () {
            openVehicleGallery(vehicle);
        });
    });
}

function openVehicleGallery(vehicle) {
    currentVehicle = vehicle;
    galleryTitle.textContent = vehicle.name;
    backButton.style.visibility = "visible";
    galleryContent.innerHTML = "";

    vehicle.images.forEach((imageName, index) => {
        const item = document.createElement("div");
        item.classList.add("galleryItem");

        const image = document.createElement("img");
        image.src = vehicle.folder + imageName;
        image.alt = vehicle.name + " image " + (index + 1);

        const label = document.createElement("p");
        label.textContent = "Image " + (index + 1);

        item.appendChild(image);
        item.appendChild(label);
        galleryContent.appendChild(item);

        item.addEventListener("click", function () {
            openFullSizeImage(vehicle.folder + imageName);
        });
    });
}

function openFullSizeImage(imagePath) {
    fullSizeImage.src = imagePath;
    imageModal.classList.add("active");
}

backButton.addEventListener("click", function () {
    if (currentBrand !== null) {
        openBrandGallery(currentBrand);
    }
});

closeButton.addEventListener("click", function () {
    closeGallery();
});

function closeGallery() {
    galleryModal.classList.remove("active");
    galleryContent.innerHTML = "";
    currentBrand = null;
    currentVehicle = null;
}

closeImageButton.addEventListener("click", function () {
    closeFullSizeImage();
});

function closeFullSizeImage() {
    imageModal.classList.remove("active");
    fullSizeImage.src = "";
}

galleryModal.addEventListener("click", function (event) {
    if (event.target === galleryModal) {
        closeGallery();
    }
});

imageModal.addEventListener("click", function (event) {
    if (event.target === imageModal) {
        closeFullSizeImage();
    }
});

document.addEventListener("keydown", function (event) {
    if (
        event.key === "Escape" &&
        imageModal.classList.contains("active")
    ) {
        closeFullSizeImage();
        return;
    }

    if (
        event.key === "Escape" &&
        galleryModal.classList.contains("active")
    ) {
        closeGallery();
    }
});

function capitalizeFirstLetter(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}