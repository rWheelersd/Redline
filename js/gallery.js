/* Add car and event collections here. image0 is always the collection thumbnail.
   See img/events/README.txt for the event folder layout. */
const vehicleLibrary = {
  ford: [
    {
      name: "Ford One",
      folder: "img/ford/fordOne/",
      images: ["image0.jpg", "image1.png", "image2.jpg"]
    }
  ]
};

const eventLibrary = {
  // Example after adding files:
  // carShow: [
  //   { name: "Car Show", folder: "img/events/carShow/",
  //     images: ["image0.jpg", "image1.jpg", "image2.jpg"] }
  // ]
};

(function () {
  "use strict";
  const brandSelect = document.getElementById("brandSelect");
  const eventSelect = document.getElementById("eventSelect");
  const eventHint = document.getElementById("eventHint");
  const galleryModal = document.getElementById("galleryModal");
  const galleryContent = document.getElementById("galleryContent");
  const galleryTitle = document.getElementById("galleryTitle");
  const backButton = document.getElementById("backButton");
  const closeButton = document.getElementById("closeButton");
  const imageModal = document.getElementById("imageModal");
  const fullSizeImage = document.getElementById("fullSizeImage");
  const closeImageButton = document.getElementById("closeImageButton");

  let currentCollection = null;
  let galleryOpener = null;
  let imageOpener = null;

  let eventCount = 0;
  for (const [key, entries] of Object.entries(eventLibrary)) {
    if (!entries.length) continue;
    const option = document.createElement("option");
    option.value = key;
    option.textContent = entries[0].name;
    eventSelect.append(option);
    eventCount++;
  }
  if (!eventCount) {
    eventSelect.disabled = true;
    eventSelect.options[0].textContent = "Events coming soon";
  } else {
    eventHint.textContent = "Select an event to see its collection.";
  }

  function openCollection(kind, key, opener) {
    const library = kind === "event" ? eventLibrary : vehicleLibrary;
    const entries = library[key];
    if (!entries || !entries.length) return;
    currentCollection = { kind, key };
    galleryOpener = opener || galleryOpener;
    galleryTitle.textContent = kind === "event" ? entries[0].name : `${key[0].toUpperCase()}${key.slice(1)} Vehicles`;
    backButton.hidden = true;
    galleryContent.replaceChildren();
    for (const entry of entries) {
      galleryContent.append(makeTile(entry.folder + entry.images[0], entry.name, entry.name, () => openAlbum(entry)));
    }
    galleryModal.classList.add("active");
    galleryModal.setAttribute("aria-hidden", "false");
    closeButton.focus();
  }

  function makeTile(path, alt, label, callback) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "galleryItem";
    const image = document.createElement("img");
    image.src = path;
    image.alt = alt;
    image.loading = "lazy";
    const text = document.createElement("p");
    text.textContent = label;
    button.append(image, text);
    button.addEventListener("click", callback);
    return button;
  }

  function openAlbum(entry) {
    galleryTitle.textContent = entry.name;
    backButton.hidden = false;
    galleryContent.replaceChildren();
    entry.images.forEach((filename, index) => {
      const path = entry.folder + filename;
      galleryContent.append(makeTile(path, `${entry.name}, photo ${index + 1}`, `Photo ${index + 1}`, (event) => {
        imageOpener = event.currentTarget;
        fullSizeImage.src = path;
        fullSizeImage.alt = `${entry.name}, photo ${index + 1}`;
        imageModal.classList.add("active");
        imageModal.setAttribute("aria-hidden", "false");
        closeImageButton.focus();
      }));
    });
    backButton.focus();
  }

  function closeImage() {
    imageModal.classList.remove("active");
    imageModal.setAttribute("aria-hidden", "true");
    fullSizeImage.removeAttribute("src");
    imageOpener?.focus();
  }

  function closeGallery() {
    if (imageModal.classList.contains("active")) closeImage();
    galleryModal.classList.remove("active");
    galleryModal.setAttribute("aria-hidden", "true");
    galleryContent.replaceChildren();
    currentCollection = null;
    galleryOpener?.focus();
  }

  brandSelect.addEventListener("change", () => {
    if (brandSelect.value) openCollection("vehicle", brandSelect.value, brandSelect);
    brandSelect.value = "";
  });
  eventSelect.addEventListener("change", () => {
    if (eventSelect.value) openCollection("event", eventSelect.value, eventSelect);
    eventSelect.value = "";
  });
  backButton.addEventListener("click", () => {
    if (currentCollection) openCollection(currentCollection.kind, currentCollection.key);
  });
  closeButton.addEventListener("click", closeGallery);
  closeImageButton.addEventListener("click", closeImage);
  galleryModal.addEventListener("click", (event) => { if (event.target === galleryModal) closeGallery(); });
  imageModal.addEventListener("click", (event) => { if (event.target === imageModal) closeImage(); });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (imageModal.classList.contains("active")) closeImage();
    else if (galleryModal.classList.contains("active")) closeGallery();
  });
})();
