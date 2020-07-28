// For help writing plugins, visit the documentation to get started:
//   https://support.insomnia.rest/article/26-plugins

let storage = {
    scopes: {},

    getScope(environment) {
        let scopes = this.scopes
        let scopeKey = environment.getEnvironmentId()
        if (scopeKey in scopes) {
            return scopes[scopeKey]
        }
        else {
            return scopes[scopeKey] = {
                token: 'no token set'
            }
        }
    }
}

let tokenTag = {
    name: 'access_token',
    displayName: 'access_token',
    description: 'Use the last found OAuth2 token form this environment',
    args: [],
    async run(arg, regexp, property) {
        let scope = storage.getScope(arg.context)

        return scope.token
    }
}

let tokenHook = function (arg) {
    let request = arg.request
    let requestURI = new URL(request.getUrl())
    if (requestURI.href.endsWith("/oauth2/v2.0/token")) {
        let response = arg.response
        let environment = request.getEnvironment()
        let responseBody = response.getBody()
        
        let responseContent = JSON.parse(responseBody.toString('utf-8'))
        
        let scope = storage.getScope(environment)

        scope.token = responseContent.access_token

        console.log('[oauth-token-finder]', 'detected new token')
    }
};

module.exports = {
    responseHooks: [tokenHook],
    templateTags: [tokenTag],
}

console.log('[oauth-token-finder]', 'loaded')