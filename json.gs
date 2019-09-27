var reddlitjsonID = "1dn06i4sLseQnbD07e8iP18uOLA8UGHt7"
var lastSec = 86400

function saveJSON(obj, id) {
  var blob,file,fileSets,obj;

/**
 * Creates a file in the users Google Drive
 */
  if(id == undefined) {
    id = reddlitjsonID
  }
  
  fileSets = {
    title: "redditlib" + ".json",
    mimeType: 'application/json'
  };

  blob = Utilities.newBlob(JSON.stringify(obj), "application/vnd.google-apps.script+json");
  
  var file_ = DriveApp.getFileById(id)
  
  var file = Drive.Files.update({
    title: file_.getName(), mimeType: file_.getMimeType()
  }, reddlitjsonID, blob);
  
  Logger.log('ID: %s, File size (bytes): %s, type: %s', file.id, file.fileSize, file.mimeType);
}

function getJSON() {
  var file = DriveApp.getFileById(reddlitjsonID)
  var content = file.getBlob().getDataAsString();
  var json = JSON.parse(content);
  return json
}

function getKey(key) {
  var cache = CacheService.getScriptCache()
  
  var value = cache.get(key)
  
  if(value == null) {
    Logger.log("getKey: null")
    var json = getJSON()
    cache.putAll(json, lastSec)
    value = cache.get(key)     
  }
  
  return value 
}


function setKeys(keys_) {
  var cache = CacheService.getScriptCache()

  var keys = {}
  
  for(var k in keys_) {
    if(typeof(keys_[k]) == "number") {
      keys[k] = keys_[k].toString()
    } else {
      keys[k] = keys_[k]
    }
  }

  cache.putAll(keys, lastSec)
  
  return keys
}