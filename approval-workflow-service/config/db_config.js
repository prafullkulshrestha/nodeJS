module.exports = global.server ? global.server.workflowMgmt.main_db : {
    url: "mongodb://localhost",
    port: "27017",
    user: "",
    password: "",
    dbname: "workflow-management",
    authdb: ""
}
