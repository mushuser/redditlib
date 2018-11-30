//
function rddt_http(api_path, payload, listing_max, creds) {
  var options;
  var mute = false
  
  if( isOauth(api_path) ) {
    var headers = {
      "Authorization":authlib.r_get_bearer(creds)
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