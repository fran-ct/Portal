var CLIENT_ID = "654333069607-t118hpn2v2ui383h9fcfpo0aspiv4tva.apps.googleusercontent.com";

class StorageDB {
    constructor(encryptionKey = null) {
        this.encryptionKey = encryptionKey;
        this.storage = localStorage;
    }

    // Establece un valor en la base de datos
    set(key, value) {
        let data = JSON.stringify(value);
        if (this.encryptionKey) {
            data = this.encrypt(data);
        }
        this.storage.setItem(key, data);
    }

    // Obtiene un valor de la base de datos
    get(key) {
        let data = this.storage.getItem(key);
        if (data && this.encryptionKey) {
            data = this.decrypt(data);
        }
        return JSON.parse(data);
    }

    // Elimina un valor de la base de datos
    remove(key) {
        this.storage.removeItem(key);
    }

    // Limpia la base de datos
    clear() {
        this.storage.clear();
    }

    // Método para encriptar datos
    encrypt(data) {
        // Implementar la lógica de XOR o alguna otra técnica
        return data; // Para simplificar, devuelvo el mismo dato (esto debe ser tu lógica de encriptado)
    }

    // Método para desencriptar datos
    decrypt(data) {
        // Implementar la lógica de XOR o alguna otra técnica
        return data; // Para simplificar, devuelvo el mismo dato (esto debe ser tu lógica de desencriptado)
    }

    // Decodifica un JWT
    parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = decodeURIComponent(atob(base64Url).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(base64);
    }

    // Verifica si un token JWT sigue siendo válido
    isGtokenValid(token) {
        const decoded = this.parseJwt(token);
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp > currentTime;
    }

    // Verifica si el token de Google ID necesita ser renovado
    checkGtoken() {
        const googleIdToken = this.get('google_id_token');
        return !googleIdToken || !this.isGtokenValid(googleIdToken);
    }
}
