var CLIENT_ID = "654333069607-t118hpn2v2ui383h9fcfpo0aspiv4tva.apps.googleusercontent.com";








/**
 * Clase para gestionar una base de datos en localStorage con cifrado opcional.
 * Esta clase abstrae la interacción con localStorage, permitiendo almacenar y recuperar datos de forma segura.
 */
class StorageDB {
    /**
     * Constructor para inicializar una instancia de StorageDB.
     * 
     * @param {string} encryptionKey - La clave utilizada para el cifrado/descifrado. Por defecto es 'default-key'.
     * @param {string} dbName - El nombre de la base de datos en localStorage. Por defecto es 'encryptedDB'.
     * @param {boolean} isEncrypted - Indica si la base de datos debe cifrar su contenido. Por defecto es true.
     */
    constructor(encryptionKey, dbName = 'encryptedDB', isEncrypted = true) {
        this.encryptionKey = encryptionKey || 'default-key';
        this.isEncrypted = isEncrypted;
        this.dbName = dbName;
        this.data = this._initializeDB(); // Cargar o inicializar la base de datos desde localStorage
        this._generateDerivedFields(); // Generar campos derivados si es necesario
    }

    /**
     * Inicializa la base de datos cargando los datos desde localStorage.
     * Si no se encuentran datos, inicializa con un objeto vacío.
     * 
     * @returns {Object} - Los datos almacenados en la base de datos.
     */
    _initializeDB() {
        const storedData = localStorage.getItem(this.dbName);
        return storedData ? JSON.parse(storedData) : {}; // Parsear el JSON almacenado o devolver un objeto vacío
    }

    /**
     * Guarda el estado actual de la base de datos en localStorage.
     */
    _saveDB() {
        localStorage.setItem(this.dbName, JSON.stringify(this.data)); // Convertir los datos a JSON y almacenarlos
    }

    /**
     * Cifra un texto dado utilizando el método de cifrado XOR con la clave proporcionada.
     * 
     * @param {string} text - El texto que se va a cifrar.
     * @returns {string} - El texto cifrado.
     */
    _encrypt(text) {
        return simpleXorEncrypt(text, this.encryptionKey); // Usar la función de cifrado XOR
    }

    /**
     * Descifra un texto cifrado dado utilizando el método de cifrado XOR con la clave proporcionada.
     * 
     * @param {string} encryptedText - El texto cifrado que se va a descifrar.
     * @returns {string} - El texto descifrado.
     */
    _decrypt(encryptedText) {
        return simpleXorDecrypt(encryptedText, this.encryptionKey); // Usar la función de descifrado XOR
    }

    /**
     * Genera y almacena campos derivados basados en los datos existentes en la base de datos.
     * Por ejemplo, si está presente el token de Google ID, extrae y almacena el perfil del usuario.
     */
    _generateDerivedFields() {
        if (this.isEncrypted) {
            const googleIdToken = this.get('google_id_token');
            if (googleIdToken) {
                const profile = this._parseJwt(googleIdToken); // Decodificar el JWT para extraer el perfil del usuario
                this.data['user_profile'] = {
                    name: profile.name,
                    email: profile.email,
                    picture: profile.picture
                };
                this._saveDB(); // Guardar los datos actualizados con los campos derivados
            }
        }
    }

    /**
     * Parsea un token JWT (JSON Web Token) para extraer su payload.
     * 
     * @param {string} token - El token JWT que se va a parsear.
     * @returns {Object} - El payload decodificado del JWT.
     */
    _parseJwt(token) {
        const base64Url = token.split('.')[1]; // Extraer la parte del payload del JWT
        const base64 = atob(base64Url.replace(/-/g, '+').replace(/_/g, '/')); // Decodificar el formato Base64 URL
        return JSON.parse(decodeURIComponent(escape(base64))); // Devolver el objeto JSON decodificado
    }

    /**
     * Almacena un valor en la base de datos bajo la clave dada.
     * Si el cifrado está habilitado, el valor será cifrado antes de ser almacenado.
     * 
     * @param {string} key - La clave bajo la cual se almacenará el valor.
     * @param {string} value - El valor que se va a almacenar.
     */
    set(key, value) {
        if (this.isEncrypted) {
            this.data[key] = this._encrypt(value); // Cifrar el valor si el cifrado está habilitado
        } else {
            this.data[key] = value; // Almacenar el valor tal cual si el cifrado está deshabilitado
        }
        this._saveDB(); // Guardar los datos actualizados en localStorage
        this._generateDerivedFields(); // Regenerar los campos derivados si es necesario
    }

    /**
     * Obtiene un valor de la base de datos por su clave.
     * Si el cifrado está habilitado, el valor será descifrado antes de ser devuelto.
     * 
     * @param {string} key - La clave del valor que se desea recuperar.
     * @returns {string|null} - El valor descifrado o null si no se encuentra.
     */
    get(key) {
        const value = this.data[key];
        if (this.isEncrypted && value) {
            return this._decrypt(value); // Descifrar el valor si el cifrado está habilitado
        }
        return value || null; // Devolver el valor tal cual o null si no se encuentra
    }

    /**
     * Elimina un valor de la base de datos por su clave.
     * 
     * @param {string} key - La clave del valor que se desea eliminar.
     */
    remove(key) {
        delete this.data[key]; // Eliminar la clave-valor de los datos
        this._saveDB(); // Guardar los datos actualizados en localStorage
        this._generateDerivedFields(); // Regenerar los campos derivados si es necesario
    }

    /**
     * Borra todos los datos de la base de datos.
     */
    clear() {
        this.data = {}; // Reiniciar los datos a un objeto vacío
        this._saveDB(); // Guardar la base de datos vacía en localStorage
    }

    /**
     * Verifica si un token JWT sigue siendo válido comparando su tiempo de expiración con el tiempo actual.
     * 
     * @param {string} token - El token JWT que se desea validar.
     * @returns {boolean} - True si el token es válido, false en caso contrario.
     */
    isTokenValid(token) {
        const decoded = this._parseJwt(token); // Decodificar el JWT para obtener el payload
        const currentTime = Math.floor(Date.now() / 1000); // Obtener el tiempo actual en segundos
        return decoded.exp > currentTime; // Comparar el tiempo de expiración con el tiempo actual
    }

    /**
     * Verifica si el token de Google ID almacenado necesita ser renovado.
     * 
     * @returns {boolean} - True si el token debe renovarse, false en caso contrario.
     */
    shouldRefreshData() {
        const googleIdToken = this.get('google_id_token');
        return !googleIdToken || !this.isTokenValid(googleIdToken); // Comprobar si el token está ausente o es inválido
    }

    /**
     * Recupera el perfil de usuario almacenado en la base de datos.
     * 
     * @returns {Object|null} - El objeto perfil de usuario o null si no está disponible.
     */
    getUserProfile() {
        return this.get('user_profile'); // Devolver el perfil de usuario si está disponible
    }
}

/**
 * Función de cifrado simple XOR.
 * Cifra un texto dado utilizando una clave con la operación XOR.
 * 
     * @param {string} text - El texto que se va a cifrar.
 * @param {string} key - La clave de cifrado.
 * @returns {string} - El texto cifrado.
 */
function simpleXorEncrypt(text, key) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length)); // Aplicar XOR a cada carácter
    }
    return result;
}

/**
 * Función de descifrado simple XOR.
 * Descifra un texto cifrado dado utilizando una clave con la operación XOR.
 * Esta función es simétrica, por lo que utiliza la misma operación que el cifrado.
 * 
 * @param {string} encryptedText - El texto cifrado que se va a descifrar.
 * @param {string} key - La clave de cifrado.
 * @returns {string} - El texto descifrado.
 */
function simpleXorDecrypt(encryptedText, key) {
    return simpleXorEncrypt(encryptedText, key); // El descifrado XOR es el mismo que el cifrado
}
