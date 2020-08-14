const generateParamUrl = (url, params) => {
    //naive way for now
    for(var paramName in params){
        url = url.replace(':' + paramName, params[paramName])
    }
    return url
}