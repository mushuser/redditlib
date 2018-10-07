var credential = {
  username:"",
  client_id:"",
  secret:"",
  refresh_token:""  
}

var SUBREDDIT;
var GD_FOLDER_ID;
var ACCESS_TOKEN;
var FLAIR_MAPPING;

function init_project(sr, creds, folder_id, flair_mapping) {
  SUBREDDIT = sr
  credential.username = creds.username
  credential.client_id = creds.client_id
  credential.secret = creds.secret
  credential.refresh_token = creds.refresh_token
  GD_FOLDER_ID = folder_id
  FLAIR_MAPPING = flair_mapping
}

function check_init() {
  if(
    (SUBREDDIT == undefined) || 
    (credential.username == undefined) ||
    (credential.client_id == undefined) ||
    (credential.secret == undefined) ||
    (credential.refresh_token == undefined) ||
    (FLAIR_MAPPING == undefined) ||
    (GD_FOLDER_ID == undefined)
    ){
    var msg = "init_project() failed, call init_project()."
    throw msg  
  }  
}

var script_pro = PropertiesService.getScriptProperties()