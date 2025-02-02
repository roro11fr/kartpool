
async function createWishlist() {  
    // Obține inputul din câmpul de text și elimină spațiile inutile
    const wishlistInput = document.getElementById("wishlist-items").value.trim();  


    console.log("USERNAME:", USERNAME);
    console.log("SELECTED_STORE_ID:", SELECTED_STORE_ID);
    console.log("wishlistInput:", wishlistInput);
    if (!wishlistInput) {
        console.log("Câmpul wishlist este gol.");
        return;
    }

    // Verifică dacă variabilele necesare sunt definite
    if (USERNAME && SELECTED_STORE_ID && wishlistInput) {  
        // Împarte inputul în elemente individuale și elimină spațiile de la începutul și sfârșitul fiecărui element
        const items = wishlistInput.split(",").map(item => item.trim());

        // Apelează funcția pentru a adăuga wishlist-ul
        await addWishlist(USERNAME, items, SELECTED_STORE_ID);  
    } else {
        // Afișează un mesaj de eroare dacă variabilele nu sunt valide
        console.log("Variabilele USERNAME, SELECTED_STORE_ID sau wishlistInput nu sunt valide.");
    }
}

async function addWishlist(username, items, storeId) {
    const messageElement = document.getElementById("message"); // Element pentru feedback

    // Obține token-ul CSRF din document
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    try {
        // Trimite cererea POST la server
        const response = await fetch('/wishlists/wishlists/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken, // Include token-ul CSRF pentru protecție
            },
            body: JSON.stringify({
                buyer: username,  // Asigură-te că incluzi buyer-ul
                items: items,
                store: storeId
            }),
        });

        // Verifică dacă cererea a fost reușită
        if (!response.ok) {
            throw new Error('Răspunsul de la server nu a fost ok');
        }
        
        // Obține răspunsul în format JSON
        const result = await response.json();
        messageElement.textContent = "Wishlist adăugat cu succes!"; // Mesaj de succes
        console.log('Wishlist adăugat cu succes:', result);
    } catch (error) {
        // Afișează un mesaj de eroare în caz de eșec
        messageElement.textContent = "Eroare la adăugarea wishlist-ului."; // Mesaj de eroare
        console.error('Eroare la adăugarea wishlist-ului:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const addWishlistButton = document.getElementById("add-wishlist");
    
    // Verifică dacă elementul există înainte să îi asignezi un eveniment
    if (addWishlistButton) {
        addWishlistButton.onclick = function(e) {  
            createWishlist();  
        }
    } else {
        console.error("Butonul cu id 'add-wishlist' nu a fost găsit.");
    }
});

async function displayNearbyWishlists(latitude, longitude) {
    try {
        const nearbyWishlists = await fetchNearbyWishlists(latitude, longitude);
        renderWishlists('nearby-wishlists', nearbyWishlists);
    } catch (error) {
        console.error(error);
    }
}

async function displayMyRequests(latitude, longitude) {  
    try {  
        const myWishlists = await fetchNearbyWishlists(latitude, longitude, {buyer: USERNAME});  
        renderWishlists('my-wishlists', myWishlists);  
    } catch(error) {  
        console.error(error);  
    }  
}

async function displayMyTrips(latitude, longitude) {  
    try {  
        const myTrips = await fetchNearbyWishlists(latitude, longitude, {wishmaster: USERNAME});  
        renderWishlists('my-trips', myTrips);  
    } catch(error) {  
        console.error(error);  
    }  
}

async function fetchNearbyWishlists(latitude, longitude, options = {}) {
    const url = new URL('/wishlists/', window.location.origin); // URL-ul pentru endpoint-ul API
    const params = new URLSearchParams();

    // Adaugă parametrii de interogare pentru latitudine, longitudine și opțiuni suplimentare
    params.append('lat', latitude);
    params.append('lng', longitude);
    for (const [key, value] of Object.entries(options)) {
        params.append(key, value);
    }
    url.search = params.toString(); // Setează parametrii în URL

    // Trimite cererea GET către server
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Eroare la încărcarea wishlist-urilor');
    }
    return await response.json(); // Returnează rezultatele ca obiect JSON
}

function renderWishlists(tabId, wishlists) {
    const container = document.getElementById(tabId);
    container.innerHTML = '';  // Golește conținutul tab-ului înainte de a-l popula

    // Afișează fiecare wishlist
    wishlists.forEach(wishlist => {
        const div = document.createElement('div');
        div.classList.add('wishlist-item');
        div.innerHTML = `
            <h3>${wishlist.store.name}</h3>
            <ul>
                ${wishlist.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
        container.appendChild(div);
    });
}
