//
function rddt_http(api_path, payload) {
  var options;
  var mute = false
  
  if( isOauth(api_path) ) {
    var headers = {
      "Authorization":get_bearer()
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
            
    return json
  }
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

//
function httpretry(url, options) {
  for(var i = 1; i <= httpretries; i++) {
    try { 
      if( options == undefined ) {
        var response = UrlFetchApp.fetch(url)
      } else {
        var response = UrlFetchApp.fetch(url, options)
      }
      var code = response.getResponseCode()
      if( code == 200 ) {
        return response
      }
    } catch(e) {
      Logger.log(e)
      Utilities.sleep(1000 * 1)
      if( i >= httpretries ) {
        throw_print("reached max retry!")
      }    
    }
  }  
}

//
function get_basicauth(client_id, secret) {
  return "Basic " + Utilities.base64Encode(client_id + ':' + secret)
}

//
function get_bearerauth(access_token) {
  return "bearer " + access_token
}