const generateParamUrl = (url, params) => {
    //naive way for now
    console.log(url)
    for(var paramName in params){
        url = url.replace(':' + paramName, params[paramName])
    }
    console.log(url)
    return url
}