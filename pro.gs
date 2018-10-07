function get_checked_comments_pro() {
  var checkeds = script_pro.getProperty("checked")
  
  return checkeds.split(",")
}

function set_checked_comments_pro(names) {
  var pro = script_pro.setProperty("checked", names.join(","))
  
  return pro
}

function get_last101_comments_pro() {
  var last100 = script_pro.getProperty("last100")
  
  return last100.split(",")
}

function set_last101_comments_pro(names) {
  var pro = script_pro.setProperty("last100", names.join(","))
  
  return pro
}