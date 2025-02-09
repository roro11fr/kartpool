
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

function clearAllTabs() {
    document.getElementById('nearby-wishlists').innerHTML = '';
    document.getElementById('my-wishlists').innerHTML = '';
    document.getElementById('my-trips').innerHTML = '';
}

function displayNearbyWishlists() {
    clearAllTabs();
    if (SELECTED_LATITUDE !== null && SELECTED_LONGITUDE !== null) {
        fetchNearbyWishlists(SELECTED_LATITUDE, SELECTED_LONGITUDE)
            .then(wishlists => renderWishlists('nearby-wishlists', wishlists))
            .catch(error => console.error(error));
    } else {
        console.log("Selectează o locație înainte de a afișa wishlist-urile.");
    }
}

const USER_ID = localStorage.getItem('user_id');

// function displayMyRequests() {
//     clearAllTabs();
//     if (SELECTED_LATITUDE !== null && SELECTED_LONGITUDE !== null) {
//         fetchMyWishlists(SELECTED_LATITUDE, SELECTED_LONGITUDE)
//             .then(wishlists => renderWishlists('my-wishlists', wishlists))
//             .catch(error => console.error(error));
//     } else {
//         console.log("Selectează o locație înainte de a afișa cererile tale.");
//     }
// }

function displayMyTrips() {
    clearAllTabs();
    if (SELECTED_LATITUDE !== null && SELECTED_LONGITUDE !== null) {
        fetchNearbyWishlists(SELECTED_LATITUDE, SELECTED_LONGITUDE, { buyer: USER_ID })
            .then(trips => renderWishlists('my-trips', trips))
            .catch(error => console.error(error));
    } else {
        console.log("Selectează o locație înainte de a afișa trip-urile tale.");
    }
}

async function fetchMyWishlists(latitude, longitude) {
    const url = new URL('/api/wishlists/my_wishlists/', window.location.origin);
    const params = new URLSearchParams();
    params.append('lat', latitude);
    params.append('lng', longitude);

    url.search = params.toString();

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include' // ✅ Trimite cookie-uri pentru autentificare
        });

        if (!response.ok) {
            throw new Error('Eroare la încărcarea wishlist-urilor mele');
        }

        const data = await response.json();
        console.log('Wishlist-urile mele:', data);

        if (Array.isArray(data.wishlists)) {
            return data.wishlists;
        } else {
            console.error("Răspunsul API nu conține un array de wishlist-uri:", data);
            return [];
        }
    } catch (error) {
        console.error('Eroare la fetching wishlist-urilor mele:', error);
        return [];
    }
}

async function fetchNearbyWishlists(latitude, longitude, options = {}) {
    const url = new URL('/wishlists/wishlists/', window.location.origin);
    const params = new URLSearchParams();
    params.append('lat', latitude);
    params.append('lng', longitude);
    
    for (const [key, value] of Object.entries(options)) {
        params.append(key, value);
    }

    url.search = params.toString();

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Eroare la încărcarea wishlist-urilor');
        }

        const data = await response.json();
        console.log('Răspunsul API:', data);  // Verifică ce răspuns primești

        if (Array.isArray(data.wishlists)) {
            return data.wishlists;
        } else {
            console.error("Răspunsul API nu conține un array de wishlist-uri:", data);
            return [];
        }
    } catch (error) {
        console.error('Eroare la fetching wishlist-urilor:', error);
        return [];
    }
}

function renderWishlists(containerId, wishlists) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';  // Curăță conținutul existent al containerului

    if (wishlists.length === 0) {
        container.innerHTML = '<p>Nu există wishlist-uri disponibile.</p>';
        return;
    }

    // Creează un element pentru fiecare wishlist
    wishlists.forEach(wishlist => {
        const wishlistElement = document.createElement('div');
        wishlistElement.classList.add('wishlist-item');
        
        // Poți adăuga mai multe detalii pentru fiecare wishlist
        wishlistElement.innerHTML = `
            <h3>Wishlist ${wishlist.buyer_name}</h3>
            <ul>
                ${wishlist.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
        
        // Adaugă elementul în container
        container.appendChild(wishlistElement);
    });
}
