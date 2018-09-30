var ARCHIVED_AGE = 180 // six months in days

var MIN_AGE = 3
var MAX_AGE = 4


var NOW = (new Date()).getTime()

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