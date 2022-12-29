export enum ClientErrorCode {
  SessionCantRestore = "CLIENT_SESSION_CANT_RESTORE",
  NetworkFail = "CLIENT_NETWORK_FAIL",
  Offline = "CLIENT_OFFLNE"
}

export enum ClientAppStateCode {
  Idle = "IDLE",
  
  FetchingTimetable = "FETCHING_TIMETABLE",
  FetchingHomeworks = "FETCHING_HOMEWORKS",
  FetchingRessources = "FETCHING_RESSOURCES",
  FetchingGrades = "FETCHING_GRADES",
  
  UpdatingHomeworkState = "UPDATING_HOMEWORK_STATE"
}
