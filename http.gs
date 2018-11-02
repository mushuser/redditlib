//
function rddt_http(api_path, payload, listing_max, creds) {
  var options;
  var mute = false
  
  if( isOauth(api_path) ) {
    var headers = {
      "Authorization":get_bearer(creds)
    }     
    
    options = {
      "headers":headers,
      "payload":payload,
      "muteHttpExceptions":mute
    }    
  } else {
    options = {
      "muteHttpExceptions":mute
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
      
      var response = httplib.httpretry(url, options) 
      var text = response.getContentText()  
      var json = JSON.parse(text) 
      var dist = json.data.dist
      var children = json.data.children

      for(var i2=0;i2 < children.length; i2++) {
        ids.push(children[i2].data.name)
        ret_children.push(children[i2])
      }  
      
      lastid = ids[ids.length-1]
      
      if((dist < 100) || (ids.length > listing_max)) {
        if(listing_max) {
          ret_children = ret_children.slice(0, listing_max)
        }
        return ret_children
      }    
    }    
  } else { 
    var response = httplib.httpretry(api_path, options)
    
    var text = response.getContentText()
    var json = JSON.parse(text)     
            
    return json
  }
}  

//
function get_bearer(creds) {
  if(creds == undefined) {
    creds = credential
  }
  
  if((creds.username == credential.username) && (ACCESS_TOKEN != undefined)) {
    return get_bearerauth(ACCESS_TOKEN)
  }
  
  var basic_auth = get_basicauth(
    creds.client_id, 
    creds.secret)

  var access_token = get_accesstoken(
    basic_auth,
    creds.refresh_token
  )
 
  return get_bearerauth(access_token)
}


function get_accesstoken(basic_auth, refresh_token) {
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
  
  var response = httplib.httpretry(url, options)
  
  var text = response.getContentText()
  var json = JSON.parse(text)
  var access_token = json.access_token
  
  return access_token
}

//

//
function get_basicauth(client_id, secret) {
  return "Basic " + Utilities.base64Encode(client_id + ':' + secret)
}

//
function get_bearerauth(access_token) {
  return "bearer " + access_token
}