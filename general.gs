var ARCHIVED_AGE = 180 // six months in days

var MIN_AGE = 3
var MAX_AGE = 5

var NOW = (new Date()).getTime()

var IDS_GD;

//
function check_values(variables) {
  var msg = ""
  var valid = true
  
  for(var i=0; i<arguments.length; i++) {
    var arg = arguments[i]
    msg = msg + "[" + i.toString() + "]" + "=" + arg + ", "
    if(arg == undefined) {
      valid = false
    }
  }
  
  if(valid == false) {
    console.info(msg)
  }
  
  return valid
}

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


function get_random(items) {
  var item = items[Math.floor(Math.random()*items.length)];
  
  return item
}