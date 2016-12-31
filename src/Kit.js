import Facebook, {isNullOrEmpty, inObj, param} from './Facebook'

export default class Kit extends Facebook {

    /**
     * Create an instance of this class.
     *
     * @param  {Object} config
     *
     * @return {Kit}
     */
    static instance(config = {}) {
        return new Kit(config)
    }

    /**
     * Make an API request to retrieve user's profile info.
     *
     * @param {Object} params Optional Params.
     *
     * @return {Promise}
     */
    getMe(params = {}) {
        return super.get('me', params)
    }

    /**
     * Get User's info with friend requests data.
     *
     * Graph API Version: v1.0 < v2.0
     *
     * @param {Integer} limit (Optional) Number of friend requests to fetch.
     *                        Supports up to 5000 max. Default: 5000
     *
     * @return {Promise}
     */
    getMeWithFriendRequests(limit = 5000) {
        return this.getMe({ fields: `id,name,picture,friendrequests.limit(${limit}).fields(from)` })
        .then(response => {
            let user = response

            user.friends = []

            if (inObj('friendrequests', response) &&
                inObj('data', response.friendrequests)
            ) {
                const data = response.friendrequests.data

                user.friends = data.map(request => {
                    if (request.from && request.from.id) {
                        return request.from.id
                    }
                })
            }

            return user
        })
    }

    /**
     * Accept a friend request for this user by FB ID.
     *
     * @param {Integer} fbid Facebook ID of the user.
     *
     * @return {Promise}
     */
    acceptFriendRequest(fbid) {
        return super.post(`me/friends/${fbid}`)
    }

    /**
     * Unfriend a friend from user's profile by FB ID.
     *
     * @param {Integer} fbid Friend's FB ID.
     *
     * @return {Promise}
     */
    unfriend(fbid) {
        return super.delete(`me/friends/${fbid}`)
    }

    /**
     * Get pages of this user.
     *
     * @param {Object} params Optional params to pass to API request.
     *
     * @return {Promise}
     */
    getPages(params = {}) {
        return super.get('me/accounts', params)
    }

    /**
     * Get a comment.
     *
     * @param  {Integer} objectId Facebook Object ID.
     * @param {Object} params Optional params.
     *
     * @return {Promise}
     */
    getComment(objectId, params = {}) {
        return super.get(objectId, params)
    }

    /**
     * Get comments of an object.
     *
     * @param  {Integer} objectId Facebook Object ID.
     * @param {Object} params Optional params.
     *
     * @return {Promise}
     */
    getComments(objectId, params = {}) {
        return super.get(`${objectId}/comments`, params)
    }

    /**
     * Comment on an object.
     *
     * @param  {Integer} objectId Facebook Object ID.
     * @param {Object} params Optional params.
     *
     * @return {Promise}
     */
    postComment(objectId, params = {}) {
        return super.post(`${objectId}/comments`, params)
    }

    /**
     * Update a comment.
     *
     * @param  {Integer} objectId Facebook Object ID.
     * @param {Object} params Optional params.
     *
     * @return {Promise}
     */
    updateComment(objectId, params = {}) {
        return super.post(objectId, params)
    }

    /**
     * Delete a comment.
     *
     * @param  {Integer} objectId Facebook Object ID.
     *
     * @return {Promise}
     */
    deleteComment(objectId) {
        return super.delete(objectId)
    }

    /**
     * Get likes of an object.
     *
     * @param  {Integer} objectId Facebook Object ID.
     * @param {Object} params Optional params.
     *
     * @return {Promise}
     */
    getLikes(objectId, params = {}) {
        return super.get(`${objectId}/likes`, params)
    }

    /**
     * Like an object.
     *
     * @param  {Integer} objectId Facebook Object ID.
     *
     * @return {Promise}
     */
    like(objectId) {
        return super.post(`${objectId}/likes`)
    }

    /**
     * Unlike an object.
     *
     * @param  {Integer} objectId Facebook Object ID.
     *
     * @return {Promise}
     */
    unlike(objectId) {
        return super.delete(`${objectId}/likes`)
    }

    /**
     * Search Facebook.
     *
     * @param  {Object} params Query, Type, and other params.
     *
     * @return {Promise}
     */
    search(params) {
        return super.get('search', params)
    }

    /**
     * Debug Access Token.
     *
     * @see  https://developers.facebook.com/docs/facebook-login/access-tokens/debugging-and-error-handling
     *
     * @param  {String} input_token The access token you want to get information about
     * @param  {String} access_token Your app access token or a valid user access token
     *                               from a developer of the app
     *
     * @return {Promise}
     */
    debugToken(input_token, access_token) {
        return super.get('debug_token', { input_token, access_token })
    }

    /**
     * Parse Access Token in Given String.
     *
     * @param {String} str String to check access token.
     *
     * @return {String}
     */
    static parseAccessToken(str) {
        const regex = /access_token=([\w\.]+)&?/
        const match = str.match(regex)

        if(!isNullOrEmpty(match) && !isNullOrEmpty(match[1])) {
            return match[1]
        } else if (str.split('access_token=')[1]) {
            return str.split('access_token=')[1].split('&')[0]
        }

        return null
    }

    /**
     * Create a popup window.
     *
     * @param {String} url URL to open in new popup window.
     * @param {Integer} width Width of the popup window.
     * @param {Integer} height Height of the popup window.
     * @param {Integer} scrollbars Determine if it should show scrollbars.
     * @param {Integer} resizable Determine if it should show scrollbars.
     */
    static popup(url, {
        width = 575, height = 240,
        scrollbars = 1,
        isMobile = false
    } = {}) {
        const name = 'p'+(Math.random()*(1<<30)).toString(16).replace('.','')

        let screenX = isNullOrEmpty(window.screenX) ? window.screenLeft : window.screenX
        let screenY = isNullOrEmpty(window.screenY) ? window.screenTop : window.screenY
        let outerWidth = isNullOrEmpty(window.outerWidth) ? document.documentElement.clientWidth : window.outerWidth
        let outerHeight = isNullOrEmpty(window.outerHeight)
          // 22= IE toolbar height
          ? (document.documentElement.clientHeight - 22) : window.outerHeight

        let popupWidth = isMobile ? null : width
        let popupHeight = isMobile ? null : height

        let sL = screenX < 0 ? window.screen.width + screenX : screenX
        let left = parseInt(sL + ((outerWidth - popupWidth) / 2), 10)
        let top = parseInt(screenY + ((outerHeight - popupHeight) / 2.5), 10)

        let opts = {
            location: 0,
            toolbar: 0,
            menubar: 0,
            resizable: 0,
            left,
            top,
            scrollbars
        }

        if (!isNullOrEmpty(popupWidth)) {
            opts.width = popupWidth
        }

        if (!isNullOrEmpty(popupHeight)) {
            opts.height = popupHeight
        }

        return window.open(url, name, param(opts, ','))
    }

    /**
     * Authenticate on facebook to get access token using popup window.
     *
     * @param  {Object} opts Login URL Options.
     * @param  {Object} popupOpts Popup Options.
     *
     * @return {this}
     */
    authenticate(opts = {}, popupOpts = {}) {
        opts.display = 'popup'

        let loginUrl = super.getLoginUrl(opts)

        this.constructor.popup(loginUrl, popupOpts)

        return this
    }
}
