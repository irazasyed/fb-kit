/**
 * Parse Fetch Response to JSON.
 *
 * @param  {Response} response
 *
 * @return {Object}
 */
function parseJSON(response) {
    return response.json()
}

/**
 * Response Handler.
 *
 * @param  {Object} response
 *
 * @return {Promise}
 */
function responseHandler(response) {
    if(!response || response.error) {
        return Promise.reject(response)
    } else {
        return Promise.resolve(response)
    }
}

/**
 * Log info to console.
 *
 * @param  {Mixed} d
 */
export function log(d) {
    console.log(d) // eslint-disable-line no-console
}

/**
 * Build URL Query from Params.
 *
 * @param  {Object} params
 * @param  {String} join   Optional - Joining delimiter. Default: &
 *
 * @return {String}        Query URL
 */
export function param(params, join) {
    let esc = encodeURIComponent

    return Object.keys(params)
    .map(k => esc(k) + '=' + esc(params[k]))
    .join(join || '&')
}

/**
 * Determine if given value is string.
 *
 * @param  {Mixed}  value
 *
 * @return {Boolean}
 */
export function isString(value) {
    return Object.prototype.toString.call(value) === '[object String]'
}

/**
 * Determine string is null or empty.
 *
 * @param  {String}  str
 *
 * @return {Boolean}
 */
export function isNullOrEmpty(str) {
    return null === str || '' === str
}

/**
 * Determine key exists in object
 *
 * @param  {String} key
 * @param  {Object} obj
 *
 * @return {Boolean}
 */
export function inObj(key, obj) {
    return Object.prototype.toString.call(obj) === '[object Object]' &&
            obj.hasOwnProperty(key) && !isNullOrEmpty(obj[key])
}

export default class Facebook {
    /**
     * Default API Params.
     *
     * @return {Object} Default Params.
     */
    defaultParams() {
        return { access_token: this.getAccessToken() }
    }

    /**
     * Create a new class instance.
     *
     * @type {Object}
     */
    constructor({
        version = 'v2.8',
        accessToken = null,
        beta = false,
        appId = null,
        debug = false
    } = {}) {
        this.setApiVersion(version)
        this.setAccessToken(accessToken)
        this.setDebug(debug)

        this.beta = beta
        this.appId = appId
    }

    /**
     * Create an instance of this class.
     *
     * @param  {Object} config
     *
     * @return {Facebook}
     */
    static instance(config = {}) {
        return new Facebook(config)
    }

    /**
     * Base API URL.
     *
     * @return {String} Based API URL
     */
    get baseGraphUrl() {
        return `https://graph.${this.beta ? 'beta.' : ''}facebook.com/`
    }

    /**
     * Get API Version.
     *
     * @return {String} API Version
     */
    getApiVersion() {
        return this.apiVersion
    }

    /**
     * Set Default API Version for all API Requests.
     *
     * @param {String} version API Version.
     *
     * @return {this}
     */
    setApiVersion(version) {
        this.apiVersion = version

        return this
    }

    /**
     * Get Access Token.
     *
     * @return {String} Access Token
     */
    getAccessToken() {
        return this.accessToken
    }

    /**
     * Set Default Access Token for API Requests.
     *
     * @param {String} accessToken Access Token
     *
     * @return {this}
     */
    setAccessToken(accessToken) {
        this.accessToken = accessToken

        return this
    }

    /**
     * Get API Debug Type.
     * Default: all
     *
     * @return {String} Debug Type
     */
    getDebug() {
        return this.debug
    }

    /**
     * Set API Debug Type.
     * One of: {all, info, warning}
     *
     * @param {String} debug Debug Type
     *
     * @return {this}
     */
    setDebug(debug) {
        this.debug = debug

        return this
    }

    /**
     * Helper to make GET API request.
     *
     * @param  {String}   endpoint API Request Endpoint
     * @param  {Object}   params   Optional Params Object
     *
     * @return {Promise}
     */
    get(endpoint, params = {}) {
        return this.api(endpoint, 'GET', params)
    }

    /**
     * Helper to make POST API request.
     *
     * @param  {String}   endpoint API Request Endpoint
     * @param  {Object}   params   Optional Params Object
     *
     * @return {Promise}
     */
    post(endpoint, params = {}) {
        return this.api(endpoint, 'POST', params)
    }


    /**
     * Helper to make DELETE API request.
     *
     * @param  {String}   endpoint API Request Endpoint
     *
     * @return {Promise}
     */
    delete(endpoint) {
        return this.api(endpoint, 'DELETE')
    }

    /**
     * Helper to make Batch API request.
     *
     * @param {Array}
     *
     * @return {Promise}
     */
    batch(batch = []) {
        return this.post('', { batch })
        .then((response => {
            if(Array.isArray(response)) {
                response.map(value => {
                    if(inObj('body', value) && isString(value.body)) {
                        value.body = JSON.parse(value.body)
                    }

                    return value
                })
            }

            return response
        }).bind(this))
    }

    /**
     * Make API Requests.
     *
     * @param  {String} endpoint API Endpoint
     * @param  {String} method   Request Method
     * @param  {Object} params   Optional Params
     *
     * @return {Promise}
     */
    api(endpoint, method = 'GET', params = {}) {
        const url = this.makeApiUrl(endpoint)

        if(method !== 'GET') {
            params.method = method.toLowerCase()
        }

        if(this.getDebug()) {
            params.debug = this.getDebug()
        }

        params = this.buildParams(params)

        return fetch(`${url}?${params}`, {
            mode: 'cors',
            cache: 'no-cache'
            // method: method.toLowerCase(),
            // headers: {
            //   'Content-Type': 'application/json'
            // },
            // body: JSON.stringify(params)
        })
        .then(parseJSON)
        .then(responseHandler)
    }

    /**
     * Make API URL with Endpoint.
     *
     * @param  {String} endpoint API Endpoint
     *
     * @return {String}          API URL with Endpoint
     */
    makeApiUrl(endpoint) {
        if ( !/^v\d+\.\d+\//.test(endpoint) ) {
            endpoint = this.getApiVersion() + '/' + endpoint
        }

        return this.baseGraphUrl + endpoint.replace(/^\//, '')
    }

    /**
     * Build Params object with Defaults.
     *
     * @param  {Object} params Optional Params Object.
     *
     * @return {Object}        Params.
     */
    buildParams(params = {}) {

        if (inObj('access_token', params)) {
            this.setAccessToken(params.access_token)
        } else {
            delete params.access_token
        }

        if(isNullOrEmpty(this.getAccessToken())) {
            throw new Error('No Access Token Set')
        }

        if (inObj('method', params) && params.method === 'post') {
            params = this.parsePostParams(params)
        }

        return param(Object.assign(this.defaultParams(), params))
    }

    /**
     * Build POST request params data.
     *
     * @param  {Object} params
     *
     * @return {Object}
     */
    parsePostParams(params) {
        let data = {}

        for (let key in params) {

            let value = params[key]
            if(!isNullOrEmpty(value) && !isString(value)) {
                value = JSON.stringify(value)
            }

            if ( value !== undefined ) {
                data[key] = value
            }
        }

        return data
    }

    /**
     * Generate Login URL.
     *
     * @param  {Object} opt Options
     *
     * @return {String}     Login URL
     */
    getLoginUrl(opt = {}) {
        let clientId = opt.appId || opt.client_id || this.appId,
            responseType = opt.responseType || opt.response_type || null,
            version = inObj('version', opt) ? opt.version : this.getApiVersion()

        if ( !clientId ) {
            throw new Error('client_id required')
        }

        if(!isNullOrEmpty(responseType) && responseType === 'code%20token') {
            responseType = 'code token'
        }

        let params = {}

        params.client_id = clientId
        params.redirect_uri = opt.redirectUri || opt.redirect_uri || 'https://www.facebook.com/connect/login_success.html'
        params.response_type = responseType || 'token'

        if(inObj('scope', opt)) {
            params.scope = opt.scope
        }

        if(inObj('display', opt)) {
            params.display = opt.display
        }

        if(inObj('state', opt)) {
            params.state = opt.state
        }

        let queryStr = param( params )

        return `https://www.facebook.com/${version}/dialog/oauth?${queryStr}`
    }
}
