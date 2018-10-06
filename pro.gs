function get_checked_comments() {
  var checkeds = script_pro.getProperty("checked")
  
  return checkeds.split(",")
}