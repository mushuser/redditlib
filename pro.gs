// argument queue
// enqueue/dequeue
var ARG_QUEUE="ARG_QUEUE"
var ARG_DELIM=";"
var VOTER_QUEUE="VOTER_QUEUE"
var VOTER_KARMA="VOTER_KARMA"

function copy_voter(from,to) {
  for(var f in from) {
    to[f] = from[f]   
  }
}
  

function get_voter_queue() {
  var pro = PropertiesService.getScriptProperties()
  var current_arg_s = pro.getProperty(VOTER_QUEUE)
  
  // voter_queue is empty, get one from arg queue
  if((current_arg_s == null) || (current_arg_s == "")) {
    var obj = get_arg_queue()

    if(obj != undefined) {
      set_voter_queue(obj)
      return get_voter_queue()
    } else {
      return undefined
    }
  }

  var current_arg_o = JSON.parse(current_arg_s)
  if(current_arg_o.voter.length < 1) {
    set_voter_queue({})    
    return get_voter_queue() 
  }

  var new_arg_o = {}
  copy_voter(current_arg_o, new_arg_o)
  
  current_arg_o.voter = current_arg_o.voter.split(ARG_DELIM)
  new_arg_o.voter = current_arg_o.voter[0] 
  current_arg_o.voter = current_arg_o.voter.slice(1)
  
  // clean voter queue while voter is empty
  if((current_arg_o.voter.length == 1) && (current_arg_o.voter[0] == undefined)) {
    set_voter_queue({})
  } else {    
    current_arg_o.voter = current_arg_o.voter.join(ARG_DELIM)
    var current_arg_s = JSON.stringify(current_arg_o)
    pro.setProperty(VOTER_QUEUE, current_arg_s)
  }
  
  return new_arg_o
}


function set_voter_queue(obj) {
  var pro = PropertiesService.getScriptProperties()
  
  if(obj.hasOwnProperty("voter")) {
    var new_obj = obj
    new_obj.voter = new_obj.voter.join(ARG_DELIM)
    var new_obj_s = JSON.stringify(new_obj)
    pro.setProperty(VOTER_QUEUE, new_obj_s)    
  } else {
    pro.setProperty(VOTER_QUEUE, "")  
  }
  
  return true
}


function get_arg_queue() {
  var pro = PropertiesService.getScriptProperties()
  var current_arg_s = pro.getProperty(ARG_QUEUE)
  
  if((current_arg_s == null) || (current_arg_s == "")) {
//    console.log("ARG_QUEUE is empty")
    return undefined
  }
  
  var current_arg_l = current_arg_s.split(ARG_DELIM)
  var arg_o = JSON.parse(current_arg_l[0])
  var new_arg_s = current_arg_l.slice(1).join(ARG_DELIM)
  pro.setProperty(ARG_QUEUE, new_arg_s)
  
  return arg_o
}

function set_arg_queue(obj) {
  var pro = PropertiesService.getScriptProperties()
  var current_arg_s = pro.getProperty(ARG_QUEUE)
  
  if((current_arg_s == null) || (current_arg_s == "")) {
    var new_arg_s = JSON.stringify(obj)
  } else {
    var new_arg_s = JSON.stringify(obj) + ARG_DELIM + current_arg_s
  }
  
//  console.log("added to ARG_QUEUE:%s", obj)
  pro.setProperty(ARG_QUEUE, new_arg_s)
  
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


function to_voter_obj(obj, dir) {
  voter_obj.name = obj.name
  voter_obj.dir = dir
  voter_obj.title = obj.title
  voter_obj.age = get_age(obj.created_utf)

  return voter_obj  
}


function set_voters_karma(karmas) {
  var karma_string = karmas.join(ARG_DELIM)
  var pro = PropertiesService.getScriptProperties()
  pro.setProperty(VOTER_KARMA, karma_string)
}


function get_voters_karma() {
  var pro = PropertiesService.getScriptProperties()
  var karma_string = pro.getProperty(VOTER_KARMA)
  if(karma_string == null) {
    var karmas = []
    var l = voter_obj.voter.length
    for(var i=0; i<l; i++) {
      karmas.push(0)    
    }
  } else {
    var karmas = karma_string.split(ARG_DELIM)
  }
  
  return karmas
}