// argument queue
// enqueue/dequeue
var ARG_QUEUE_UP="ARG_QUEUE_UP"
var ARG_QUEUE_DOWN="ARG_QUEUE_DOWN"
var ARG_DELIM=";"

function get_argument(ARG_TYPE) {
  var pro = PropertiesService.getScriptProperties()
  var current_arg_s = pro.getProperty(ARG_TYPE)
  
  if((current_arg_s == null) || (current_arg_s == "")) {
    return undefined
  }
  
  var current_arg_l = current_arg_s.split(ARG_DELIM)
  var arg_o = JSON.parse(current_arg_l[0])
  var new_arg_s = current_arg_l.slice(1).join(ARG_DELIM)
  pro.setProperty(ARG_TYPE, new_arg_s)
  
  return arg_o
}

function set_argument(ARG_TYPE, obj) {
  var pro = PropertiesService.getScriptProperties()
  var current_arg_s = pro.getProperty(ARG_TYPE)
  
  if((current_arg_s == null) || (current_arg_s == "")) {
    var new_arg_s = JSON.stringify(obj)
  } else {
    var new_arg_s = current_arg_s + ARG_DELIM + JSON.stringify(obj)
  }
  
  pro.setProperty(ARG_TYPE, new_arg_s)
  
  return new_arg_s
}


function dump_argument(ARG_TYPE) {
  var pro = PropertiesService.getScriptProperties()
  var current_arg_s = pro.getProperty(ARG_TYPE)
  
  return current_arg_s
}

function clean_argument(ARG_TYPE) {
  var pro = PropertiesService.getScriptProperties()
  var current_arg_s = pro.setProperty(ARG_TYPE,"")
  
  return current_arg_s
}