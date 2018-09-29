//
function get_kind(api_path) {
  var occurrences = (api_path.match(/\//g) || []).length
  if(occurrences < 8) {
    return "t3"
  }else if(occurrences >= 8) {
    return "t1"
  }
  
  return undefined
}

function get_kind_children(json, kind) {
  var child1 = json[0].data.children[0]
  var child2 = json[1].data.children[0]
  
  if(child1.kind == kind) {
    return child1
  } else if(child2.kind == kind) {
    return child2
  }
  
  return undefined
}

//
function rddt_http(api_path, payload) {
  var options;
  
  if( isOauth(api_path) ) {
    var headers = {
      "Authorization":get_bearer()
    }     
    
    options = {
      "headers":headers,
      "payload":payload
    }    
  }
  
  if( isListing(api_path) ) {
    var ret_children = []
    var lastid;
    var ids = [];
    
    for(var i=0; ; i++) {
      if(i > 0) {
        var url = api_path + "&after=" + lastid
      } else {
        var url = api_path
      }
      
      var response = httpretry(url, options) 
      var text = response.getContentText()  
      var json = JSON.parse(text) 
      var dist = json.data.dist
      var children = json.data.children

      for(var i2=0;i2 < children.length; i2++) {
        ids.push(children[i2].data.name)
        ret_children.push(children[i2])
      }  
      
      lastid = ids[ids.length-1]
      
      if( dist < 100 ) {
        return ret_children      
      }    
    }    
  } else { 
    var response = httpretry(api_path, options)
    
    var text = response.getContentText()
    var json = JSON.parse(text)     
    
//    var len = json.length
//    var kind = get_kind(api_path)
//    Logger.log(json)
//    var children = get_kind_children(json, kind)
        
    return json
  }
}  

//
function rddt_read(api_path, obj_path, payload) {
  var json = rddt_http(api_path, payload)
  var result = deep_read(json, obj_path)
  return result
}

//
function get_bearer() {
  var basic_auth = get_basicauth(
    credential.client_id, 
    credential.secret)

  var access_token = get_accesstoken(
    basic_auth,
    credential.refresh_token
  ) 

  return get_bearerauth(access_token)
}

function get_accesstoken(basic_auth, refresh_token) {
  if(ACCESS_TOKEN) {
    return ACCESS_TOKEN
  } else {
    var url = "https://www.reddit.com/api/v1/access_token"
    
    var headers = {
      "Authorization":basic_auth
    }
    
    var payload = {
      "grant_type":"refresh_token",
      "refresh_token":refresh_token,    
    }
    
    var options = {
      "headers":headers,
      "method":"post",
      "payload":payload
    }
    
    var response = httpretry(url, options)
    
    var text = response.getContentText()
    var json = JSON.parse(text)
    var access_token = json.access_token
    
    return access_token
  }
}


function get_basicauth(client_id, secret) {
  return "Basic " + Utilities.base64Encode(client_id + ':' + secret)
}


function get_bearerauth(access_token) {
  return "bearer " + access_token
}