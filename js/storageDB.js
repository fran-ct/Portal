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
        if (!data) return null; // Si no hay datos, devuelve null

        if (this.encryptionKey) {
            data = this.decrypt(data);
        }
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error(`Error parsing data for key ${key}:`, e);
            this.remove(key); // Remover el valor corrupto del almacenamiento
            return null; // Devolver null si ocurre un error al parsear
        }
    }

    // Elimina un valor de la base de datos
    remove(key) {
        this.storage.removeItem(key);
    }

    // Limpia la base de datos
    clear() {
        this.storage.clear();
    }

    // Método para encriptar datos usando XOR
    encrypt(data) {
        return data.split('').map((char, i) => {
            return String.fromCharCode(char.charCodeAt(0) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length));
        }).join('');
    }

    // Método para desencriptar datos usando XOR
    decrypt(data) {
        return this.encrypt(data); // XOR es reversible de la misma manera
    }

    // Decodifica un JWT
    parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = decodeURIComponent(atob(base64Url).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(base64);
        } catch (e) {
            console.error("Error parsing JWT:", e);
            return null;
        }
    }

    // Verifica si un token JWT sigue siendo válido
    isGtokenValid(token) {
        const decoded = this.parseJwt(token);
        if (!decoded) return false; // Si el token no se pudo decodificar, no es válido
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp > currentTime;
    }

    // Verifica si el token de Google ID necesita ser renovado
    checkGtoken() {
        const googleIdToken = this.get('google_id_token');
        return !googleIdToken || !this.isGtokenValid(googleIdToken);
    }
}
