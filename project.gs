var credential = {
  username:undefined,
  client_id:undefined,
  secret:undefined,
  refresh_token:undefined  
}


var credential_voters = undefined


var SUBREDDIT;
var SECRET_SR;
var GD_FOLDER_ID;
var ACCESS_TOKEN;
var FLAIR_MAPPING;


var voter_obj = {
  name:undefined,
  dir:undefined,
  age:undefined,
  title:undefined,
  voter:[]
} 


function init_project(sr, secret_sr, creds, creds_voters, folder_id, flair_mapping) {
  SUBREDDIT = sr
  SECRET_SR = secret_sr
  credential.username = creds.username
  credential.client_id = creds.client_id
  credential.secret = creds.secret
  credential.refresh_token = creds.refresh_token
  credential_voters = creds_voters
  
  for(var i in credential_voters) {
    voter_obj.voter.push(credential_voters[i].username)
  }
  
  GD_FOLDER_ID = folder_id
  FLAIR_MAPPING = flair_mapping
}


function check_init() {
  if(
    (SUBREDDIT == undefined) || 
    (SECRET_SR == undefined) || 
    (credential.username == undefined) ||
    (credential.client_id == undefined) ||
    (credential.secret == undefined) ||
    (credential.refresh_token == undefined) ||
    (credential_voters == undefined) ||  
    (FLAIR_MAPPING == undefined) ||
    (GD_FOLDER_ID == undefined)
    ){
    var msg = "init_project() failed, call init_project()."
    throw msg  
  }  
}