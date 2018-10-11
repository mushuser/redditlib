function get_last_checked_pro() {
  var last_checked = script_pro.getProperty("last_checked")
  
  return last_checked
}


function set_last_checked_pro(last_checked) {
  if(typeof(last_checked) != 'string') {
    last_checked = last_checked.toString()
  }
  var pro = script_pro.setProperty("last_checked", last_checked)
  
  return pro
}