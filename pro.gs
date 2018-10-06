function get_checked_comments() {
  var checkeds = script_pro.getProperty("checked")
  
  return checkeds.split(",")
}

function set_checked_comments(names) {
  var checkeds = script_pro.setProperty("checked", names.join(","))
  
  return checkeds
}