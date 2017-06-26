module.exports = global.server ? global.server.workflowMgmt.main_pg_db : {
    url: "pg://",
    port: "5432",
    user: "postgres",
    password: "pkulshrestha",
    dbname: "workflow",
    servername: "localhost"
}
