// Funcția pentru a adăuga harta
function addMap() {
    const map = L.map('map').setView([44.4268, 26.1025], 12); // Setează coordonatele inițiale pentru București

    // Adaugă tileLayer de la OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Adaugă o scară la hartă
    L.control.scale().addTo(map);

    console.log('Map initialized'); // Confirmare că harta s-a inițializat

    return map;
}

// Funcția pentru a adăuga geocoder
function addGeocoder(map) {
    const geocoder = L.Control.geocoder({
        defaultMarkGeocode: true
    }).addTo(map);

    // Evenimentul declanșat când o locație este găsită
    geocoder.on('markgeocode', function (e) {
        console.log('Geocode event data:', e); // Verifică structura evenimentului

        const center = e.geocode && e.geocode.center; // Verifică dacă geocode are un centru valid

        if (center && center.lat !== undefined && center.lng !== undefined) {
            // Setează harta la locația găsită
            map.setView(center, 12);

            // Obține magazinele în apropiere
            fetchNearbyStores(center.lat, center.lng).then(stores => {
                console.log('Stores response:', stores); // Loghează răspunsul
                if (stores.length > 0) {
                    const geoJson = convertToGeoJson(stores);
                    plotStoresOnMap(map, geoJson);
                } else {
                    console.log('No stores found for the selected location.');
                }
            });
        } else {
            console.error('Coordonatele sunt invalide:', center); // Log pentru coordonate invalide
        }
    });

    console.log('Geocoder added'); // Confirmare că geocoder-ul a fost adăugat
}

// Funcția pentru a obține magazinele în apropiere (API call)
async function fetchNearbyStores(latitude, longitude) {
    try {
        const response = await fetch(`/stores/?lat=${latitude}&lng=${longitude}`);
        if (!response.ok) {
            throw new Error('Error fetching stores: ' + response.statusText);
        }
        const data = await response.json();
        console.log('Data from server:', data); // Logarea datelor primite
        return data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Funcția pentru a converti magazinele în GeoJSON
function convertToGeoJson(stores) {
    console.log('Converting stores to GeoJSON:', stores); // Log pentru magazine
    return {
        type: "FeatureCollection",
        features: stores.map(store => {
            if (store.longitude !== undefined && store.latitude !== undefined) {
                return {
                    type: "Feature",
                    geometry: {
                        type: 'Point',
                        coordinates: [store.longitude, store.latitude] // OpenStreetMap cere [lng, lat]
                    },
                    properties: {
                        id: store.id,
                        name: store.name,
                        address: store.address,
                        phone: store.phone,
                        distance: store.distance
                    }
                };
            } else {
                console.error('Store data is missing coordinates:', store); // Log pentru magazine fără coordonate
                return null;
            }
        }).filter(feature => feature !== null) // Filtrează magazinele null
    };
}

// Funcția pentru a plota magazinele pe hartă
function plotStoresOnMap(map, storesGeoJson) {
    console.log('GeoJSON to plot:', storesGeoJson); // Log pentru GeoJSON

    if (!storesGeoJson.features.length) {
        console.log('No stores found to plot on the map.'); // Verifică dacă sunt magazine de afișat
        return; // Ieși din funcție dacă nu sunt magazine
    }

    // Definirea iconului personalizat
    const storeIcon = L.icon({
        iconUrl: '/static/home/images/shop_icon.png', // Calea corectă către imagine
        iconSize: [30, 30], // Dimensiunile iconului (lățime, înălțime)
        iconAnchor: [15, 30], // Punctul de ancorare al iconului
        popupAnchor: [0, -30] // Punctul de ancorare al popup-ului
    });

    // Afișăm fiecare magazin pe hartă
    storesGeoJson.features.forEach(store => {
        const coordinates = store.geometry.coordinates; // Coordonatele GeoJSON sunt [lng, lat]
        const properties = store.properties;
    
        console.log(`Plotting store: ${properties.name} at coordinates: ${coordinates}`);
    
        const marker = L.marker([coordinates[1], coordinates[0]], { icon: storeIcon }) // Folosește iconul personalizat
            .bindPopup(`<b>${properties.name}</b><br>Adresă: ${properties.address}<br>Telefon: ${properties.phone || 'N/A'}<br>Distanță: ${properties.distance.toFixed(2)} km`)
            .addTo(map);

         marker.on('click', function () {
            const storeId = properties.id; // Reținem id-ul magazinului
            console.log('Store ID clicked:', storeId);
            SELECTED_STORE_ID = storeId; // Stocăm ID-ul magazinului selectat într-o variabilă globală
        });
    });
}

// Inițializează harta și geocoderul
document.addEventListener('DOMContentLoaded', () => {
    const map = addMap();
    addGeocoder(map);
});
