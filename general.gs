//
function deep_read(obj, path) {
  if( path ) {   
    var parts = path.split('/');
    var curr = obj;
   
    for(var i=1;i<parts.length-1;i++) {
      curr = curr[parts[i]] || {};
    }
    
    return curr[parts[parts.length-1]];
  } else {
    return obj
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
function throw_print(usermsg) {
  var caller = getCaller()
  var msg = caller+":"+usermsg
  throw msg
}

//
function getCaller()
{
  var stack;
  try {
    throw new Error("");
  } catch(e) {
    stack = e.stack;
  } finally {
    var stacks = stack.split("\n")
    var last = stacks[stacks.length-2]
    var m = last.match(/at (.*)/)
    
    return m[1]
  }
}