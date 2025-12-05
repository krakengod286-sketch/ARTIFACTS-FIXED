/* ==========================================================
   MULTI-ARTIST LOCALSTORAGE SYSTEM
========================================================== */

// Get all artists or return empty object
function loadArtists() {
  return JSON.parse(localStorage.getItem("artists") || "{}");
}

// Save artists back to storage
function saveArtists(data) {
  localStorage.setItem("artists", JSON.stringify(data));
}

// Get current user
function getCurrentUser() {
  return localStorage.getItem("currentUser");
}

// Get current artist object
function getArtistData() {
  const user = getCurrentUser();
  const artists = loadArtists();

  if (!user || !artists[user]) return null;

  return artists[user];
}

// Save changes to current artist only
function updateArtistData(callback) {
  const user = getCurrentUser();
  const artists = loadArtists();

  if (!user || !artists[user]) return;

  callback(artists[user]); // modify artist object

  saveArtists(artists);
}

/* ==========================================================
   ARTIST PROFILE (profile.html)
========================================================== */

function loadProfile() {
  const artist = getArtistData();
  if (!artist) return alert("No artist logged in!");

  document.getElementById("artistName").value = artist.profile.name;
  document.getElementById("artistBio").value = artist.profile.bio;

  document.getElementById("profilePic").src =
    artist.profile.profilePic || "https://via.placeholder.com/200x200?text=Profile+Pic";
}

function saveProfile() {
  updateArtistData(artist => {
    artist.profile.name = document.getElementById("artistName").value;
    artist.profile.bio = document.getElementById("artistBio").value;
  });

  alert("Profile saved!");
}

function saveProfilePic() {
  const file = document.getElementById("profilePicInput").files[0];
  if (!file) return alert("Please choose an image first!");

  const reader = new FileReader();
  reader.onload = () => {
    updateArtistData(artist => {
      artist.profile.profilePic = reader.result;
    });

    document.getElementById("profilePic").src = reader.result;

    alert("Profile picture updated!");
  };

  reader.readAsDataURL(file);
}

/* ==========================================================
   ARTWORK UPLOAD + DELETE (upload.html)
========================================================== */

function addArtwork() {
  const file = document.getElementById("artInput").files[0];
  const title = document.getElementById("artTitle").value.trim();
  const desc = document.getElementById("artDesc").value.trim();

  if (!file) return alert("Select an artwork first!");
  if (!title) return alert("Enter artwork title!");

  const reader = new FileReader();
  reader.onload = () => {
    updateArtistData(artist => {
      artist.artworks.push({
        img: reader.result,
        title: title,
        desc: desc
      });
    });

    displayArtworks();
  };

  reader.readAsDataURL(file);
}

function deleteArtwork(index) {
  updateArtistData(artist => {
    artist.artworks.splice(index, 1);
  });

  displayArtworks();
}

function displayArtworks() {
  const container = document.getElementById("artList");
  if (!container) return;

  const artist = getArtistData();
  if (!artist) return;

  container.innerHTML = "";

  artist.artworks.forEach((art, i) => {
    const img = art.img;
    container.innerHTML += `
      <div class="card">
        <img src="${img}">
        <p><strong>${art.title}</strong></p>
        <p>${art.desc}</p>
        <button onclick="deleteArtwork(${i})">Delete</button>
      </div>
    `;
  });
}

/* ==========================================================
   ARTIST PORTFOLIO (artist.html)
========================================================== */

function loadPortfolio() {
  const artist = getArtistData();
  if (!artist) return alert("No artist logged in!");

  document.getElementById("artistDisplayName").textContent =
    artist.profile.name || "Unnamed Artist";

  document.getElementById("artistDisplayBio").textContent =
    artist.profile.bio || "No biography available.";

  document.getElementById("artistPic").src =
    artist.profile.profilePic || "https://via.placeholder.com/200x200?text=Artist";

  const gallery = document.getElementById("artGallery");
  gallery.innerHTML = "";

  artist.artworks.forEach(art => {
    const el = document.createElement("img");
    el.src = art.img;
    gallery.appendChild(el);
  });
}

/* ==========================================================
   AR VIEWER (ar.html)
========================================================== */

let arIndex = 0;

function initAR() {
  const artist = getArtistData();
  if (!artist) return alert("No artist logged in!");

  const artworks = artist.artworks;
  const assetContainer = document.getElementById("arAssets");
  const plane = document.getElementById("arPlane");

  const titleText = document.getElementById("arTitle");
  const descText = document.getElementById("arDesc");

  if (!assetContainer || !plane) return;

  // Add images to A-Frame assets
  artworks.forEach((art, i) => {
    const asset = document.createElement("img");
    asset.id = "art-" + i;
    asset.src = art.img;
    assetContainer.appendChild(asset);
  });

  function updateAR() {
    if (artworks.length === 0) return;

    const item = artworks[arIndex];

    plane.setAttribute("src", "#art-" + arIndex);

    titleText.setAttribute("value", item.title || "(Untitled)");
    descText.setAttribute("value", item.desc || "");
  }

  updateAR();

  document.getElementById("prevArt").onclick = () => {
    arIndex = (arIndex - 1 + artworks.length) % artworks.length;
    updateAR();
  };

  document.getElementById("nextArt").onclick = () => {
    arIndex = (arIndex + 1) % artworks.length;
    updateAR();
  };
}
